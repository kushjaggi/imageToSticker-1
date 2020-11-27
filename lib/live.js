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

🥎*Current Run Rate:* ${stat.slice(-4)}
🏏*Live Score:* ${score.split('*')[0]}`

            resolve(content)
        }).catch((err) => {
            console.error(err)
            reject(err)
        })
})