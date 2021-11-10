const express = require('express')
const cors = require('cors')
const axios = require('axios')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const parser = require('xml-js')
const fs = require('fs')
const nodemailer = require('nodemailer')
const isoCountry = require('iso-country-currency')

// https://nodemailer.com/about/

/*
 * SMTP: smtp.octo-3d.tech
 * SMTP port: 587
 * user: noreply@octo-3d.tech
 * pass: RY@)cVu0
 */

const { MongoClient } = require('mongodb')
const { CuraWASM } = require('cura-wasm')
const {resolveDefinition} = require('cura-wasm-definitions')

const PASSWORD = process.env.PASSWORD
const DATABASE = process.env.DATABASE
const CLUSTER = process.env.CLUSTER
const PORT = process.env.PORT
const EMAIL_SMTP = process.env.EMAIL_SMTP
const EMAIL_PORT = process.env.EMAIL_PORT
const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS

const uri = `mongodb+srv://octoturge:${PASSWORD}@${CLUSTER}/${DATABASE}?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

const transporter = nodemailer.createTransport({
    host: EMAIL_SMTP,
    port: EMAIL_PORT,
    secure: false,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false,
        secure: false,
        ignoreTLS: true,
        minVersion: 'TLSv1'
    }
})


const app = express()

app.set('trust proxy', true)

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(fileUpload({createParentPath: true}))
app.use(cookieParser())
app.use(cors())

app.get('/:site', async(req, res) => {
    res.redirect('/')
})

app.post('/api/:site', async(req, res) => {
    let url
    switch (req.params.site) {
    case 'filaments':
    case 'opinions':
        client.connect(() => {
            const collection = client.db(DATABASE).collection(req.params.site)
            collection.find({}).toArray((err, data) => {
                res.send(data)
            })
        })
        break

    case 'currencies':
        url = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml'
        await axios.get(url).then((result) => {
            const currencies = parser.xml2js(
                result.data, {spaces: 2, compact: true}
            )['gesmes:Envelope'].Cube.Cube.Cube.map(val => {
                return val['_attributes'].currency
            })

            currencies.push('EUR')

            res.json(currencies)
        })
        break

    case 'gallery':
        client.connect(() => {
            const collection = client.db(DATABASE).collection('opinions')
            collection.find({}).toArray((err, opinions) => {
                res.send(opinions)
            })
        })
        break

    case 'contact':
        await transporter.sendMail({
            from: `"${req.body.name}" <noreply@octo-3d.tech>`,
            to: 'octoturge@octo-3d.tech',
            subject: `Contact ${(new Date).toISOString()}`,
            html: (
                `<main>${req.body.message}</main>`
                + '<br /><address style="font-style: oblique">'
                + `${req.body.name}`
                + `<br />Email address: ${req.body.email}`
                + `<br />Phone number: ${req.body.phone}`
                + '</address>'
            )
        }).then(res.send())
        break

    case 'printing':
        const fileName = `${req.files.upload.name}-${Date.now().toString()}.stl`
        await req.files.stl.mv('./tmp/' + fileName)
        const file = fs.readFileSync('./tmp/' + fileName).buffer

        await transporter.sendMail({
            from: `"${req.body.name}" <noreply@octo-3d.tech>`,
            to: 'octoturge@octo-3d.tech',
            subject: `Request file printing ${(new Date).toISOString()}`,
            html: (
                `<main>`
                + `Material: <b>${req.body.material}</b>`
                + `Color: <b>${req.body.color}</b>`
                + `Quality: <b>${req.body.quality}</b>`
                + `Price: <b>${req.body.price}</b>`
                + '</main>'
                + '<br /><address style="font-style: oblique">'
                + `${req.body.name}`
                + `<br />Email address: ${req.body.email}`
                + `<br />Phone number: ${req.body.phone}`
                + `<br />Street address: ${req.body.street}`
                + `<br />State: ${req.body.state}`
                + `<br />Country: ${req.body.country}`
                + `<br />Postal/ZIP code: ${req.body.postal}`
                + '</address>'
            ),
            attachments: [
                {
                    filename: fileName,
                    content: file
                }
            ]
        }).then(res.send())
        
        fs.unlinkSync('./tmp/' + fileName)
        res.redirect('/')
        break

    case 'location':
        const clientIP = req.ip.slice(req.ip.lastIndexOf(':') + 1)
        url = 'http://ip-api.com/json/' + clientIP
        const data = (await axios.get(url)).data
        if (data.status === 'fail') {
            res.send({ currency: 'USD' })
        } else {
            url = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml'
            await axios.get(url).then((result) => {
                const currencies = parser.xml2js(
                    result.data, {compact: true}
                )['gesmes:Envelope'].Cube.Cube.Cube.map(val => {
                    return val['_attributes'].currency
                })

                currencies.push('EUR')

                const curr = currencies.find(curr => {
                    return curr === isoCountry.getParamByISO(data.countryCode, 'currency')
                })

                res.send({currency: (curr ? curr : 'USD')})
            })
        }
        break
    
    case 'slice':
        const fileName = `${Date.now().toString()}.stl`
        await req.files.stl.mv('./tmp/' + fileName)
        const file = fs.readFileSync('./tmp/' + fileName).buffer
        const slicer = new CuraWASM({
            definition: resolveDefinition('creality_ender5'),
            /*
            overrides: [
                {
                    key: 'material_final_print_temperature',
                    value: 210
                },
                {
                    key: 'speed_print',
                    value: 40
                },
                {
                    key: 'wall_thickness',
                    value: 0.1
                }
            ],
            */
            transfer: true,
            // verbose: true
        })

        // slicer.on('progress', percent => {
        //     console.log(`Progress: ${percent}%`);
        // })

        // const { gcode, metadata } = await slicer.slice(file, 'stl')
        // fs.writeFileSync('./stl.gcode', new Uint8Array(gcode))
        const { metadata } = await slicer.slice(file, 'stl')

        await slicer.destroy()
        fs.unlinkSync('./tmp/' + fileName)

        client.connect(() => {
            const collection = client.db(DATABASE).collection('filaments')
            collection.findOne({
                material: req.body.material,
                color: req.body.color
            }, async(err, filament) => {
                const price = await calcPrice(
                    metadata.printTime,
                    metadata.filamentUsage,
                    filament.density,
                    filament.price,
                    filament.weight,
                    req.cookies['CLIENT_CURRENCY'],
                    req.body.quality
                )
                res.send(price)
            })
        })
        break
    }
})

async function calcPrice(
    printTime,          // s
    filamentUsage,      // mm^3
    filamentDensity,    // g/cm^3
    filamentPrice,      // EUR
    filamentWeight,     // g
    clientCurrency,
    quality
) {
    url = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml'
    const ecbConversion = (await axios.get(url)).data

    const currencies = parser.xml2js(
        ecbConversion, {compact: true}
    )['gesmes:Envelope'].Cube.Cube.Cube.map(val => {
        return val['_attributes']
    })

    currencies.push({
        currency: 'EUR',
        rate: 1
    })

    let curr = currencies.find(curr => {return curr.currency === clientCurrency})

    const handlingFee = 1               // 1 EUR
    const electricityCost = 0.2         // EUR/kWh
    const powerConsumption = 100        // W
    const failRate = 1.5                // 20%
    const margin = 2                    // +100%
    let qualityMultiplier = 1           // 100%

    switch (quality) {
        case 'high':
            qualityMultiplier += 0.5    // +50%
            break
        case 'low':
            qualityMultiplier -= 0.25   // -25%
            break
    }

    const price = ((
        (filamentUsage * (filamentDensity / 1000)) * (filamentPrice / filamentWeight)
    ) * failRate * margin + electricityCost * (powerConsumption / 1000) * (printTime / 3600)) * qualityMultiplier + handlingFee

    return {
        local: Math.round((price * curr.rate + Number.EPSILON) * 100) / 100,
        global: Math.round((price * parseFloat(currencies.find(curr => {return curr.currency === 'USD'}).rate) + Number.EPSILON) * 100) / 100
    }
}

app.listen(PORT, () => {
    console.log('Server started on port: ' + PORT)
})
