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
            const content = `
*COVID 19 Latest Data🦠*

_Country:_ ${Country_Region}
_Confirmed:_ ${Confirmed}
_Deaths:_ ${Deaths}
_Recovered:_ ${Recovered}
_Active:_ ${Active}

*सावधान रहें सतर्क रहें😷😷*`

            resolve(content)
        }).catch((err) => {
            console.error(err)
            reject(err)
        })
})