const { fetchJson } = require('../utils/fetcher')

/**
 * Get COVID Information
 *
 * @param {nothing} COVIDINFO 
 *
 */

module.exports = covid = () => new Promise((resolve, reject) => {
    fetchJson('http://corona.coollabs.work/country/80', { method: 'GET' })
        .then((result) => {
            const { Country_Region, Confirmed, Deaths, Recovered, Active } = result
            const content = `*Current COVID-19 Data*
            *Country:* ${Country_Region}
            *Confirmed:* ${Confirmed}
            *Deaths:* ${Deaths}
            *Recovered:* ${Recovered}
            *Active:* ${Active}
            *Stay At Home :)*`

            resolve(content)
        }).catch((err) => {
            console.error(err)
            reject(err)
        })
})