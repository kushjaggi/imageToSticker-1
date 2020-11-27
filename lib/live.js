const { fetchJson } = require('../utils/fetcher')

/**
 * Get Live Score
 *
 * @param {nothing} LIVESCORE
 *
 */

module.exports = live = () => new Promise((resolve, reject) => {
    fetchJson('https://cricapi.com/api/cricketScore?apikey=9g48pL30h5a6kEriCFmzu4kO6hk1&unique_id=1223955', { method: 'GET' })
        .then((result) => {
            const { stat, score } = result
            const content = `
*India vs Australia*

🥎*CRR:* ${stat.slice(-4)}
🏏*Score:* ${score}
⏱_${stat.split('s.')[0]}_`

            resolve(content)
        }).catch((err) => {
            console.error(err)
            reject(err)
        })
})