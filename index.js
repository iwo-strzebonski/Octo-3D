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
    let url, transporter, file, fileName, data

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

    case 'contact':
        transporter = nodemailer.createTransport({
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

        await transporter.sendMail({
            from: `"${req.body.name}" <noreply@octo-3d.tech>`,
            to: 'octoturge@octo-3d.tech',
            subject: `Contact ${(new Date).toISOString()}`,
            html: (
                `<main>${req.body.message}</main>`
                + '<br />'
                + '<br /><address style="font-style: oblique; border-top: 1px solid black">'
                + `${req.body.name}`
                + `<br />Email address: ${req.body.email}`
                + `<br />Phone number: ${req.body.phone}`
                + '</address>'
            )
        }).then(res.send())
        break

    case 'printing':
        transporter = nodemailer.createTransport({
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

        fileName = `${Date.now().toString()}-${req.files.stl.name}`
        await req.files.stl.mv('./tmp/' + fileName)
        file = fs.readFileSync('./tmp/' + fileName)

        await transporter.sendMail({
            from: `"${req.body.name}" <noreply@octo-3d.tech>`,
            to: 'octoturge@octo-3d.tech',
            subject: `Request file printing ${(new Date).toISOString()}`,
            html: (
                `<main>`
                + `Material: <b>${req.body.material}</b>`
                + `<br />Color: <b>${req.body.color}</b>`
                + `<br />Quality: <b>${req.body.quality}</b>`
                + `<br />Price: <b>${req.body.price} USD</b>`
                + '</main>'
                + '<br />'
                + '<br /><address style="font-style: oblique; border-top: 1px solid black">'
                + `${req.body.name}`
                + `<br />Email address: ${req.body.email}`
                + `<br />Phone number: ${req.body.phone}`
                + `<br />Street address:<br />${req.body.street}`
                + `<br />City: ${req.body.city}`
                + `<br />Country: ${req.body.country}`
                + `<br />State: ${req.body.state}`
                + `<br />Postal/ZIP code: ${req.body.postal}`
                + '</address>'
            ),
            attachments: [
                {
                    filename: fileName,
                    content: file
                }
            ]
        })
        
        fs.unlinkSync('./tmp/' + fileName)
        res.redirect('/')
        break

    case 'location':
        url = 'http://ip-api.com/json/' + req.ip.slice(req.ip.lastIndexOf(':') + 1)
        data = (await axios.get(url)).data
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
        fileName = `${Date.now().toString()}.stl`
        await req.files.stl.mv('./tmp/' + fileName)
        file = fs.readFileSync('./tmp/' + fileName).buffer
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
                {
                    key: 'machine_nozzle_size',
                    value: 0.2
                },
                {
                    key: 'line_width',
                    value: 0.2
                },
                {
                    key: 'wall_line_width',
                    value: 0.2
                },
                {
                    key: 'speed_print',
                    value: 40
                }
            ],
            */
            
            transfer: true,
            verbose: false
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
    const failRate = 1.2                // 20%
    const margin = 2                    // +100%
    let qualityMultiplier = 1           // 100%

    switch (quality) {
        case 'high':
            qualityMultiplier += 0.5    // +50%
            printTime *= 2
            break
        case 'low':
            qualityMultiplier -= 0.25   // -25%
            printTime /= 2
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
