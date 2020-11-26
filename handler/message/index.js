require('dotenv').config()
const { decryptMedia, Client } = require('@open-wa/wa-automate')
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
const { downloader, cekResi, removebg, urlShortener, meme, translate, covid, getLocationData } = require('../../lib')
const { msgFilter, color, processTime, is } = require('../../utils')
const mentionList = require('../../utils/mention')
const { uploadImages } = require('../../utils/fetcher')


const { menuId, menuEn } = require('./text')

module.exports = msgHandler = async (client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, isGif, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName // verifiedName is the name of someone who uses a business account
        const botNumber = await client.getHostNumber() + '@c.us'
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const groupMembers = isGroupMsg ? await client.getGroupMembersId(groupId) : ''
        const isGroupAdmins = groupAdmins.includes(sender.id) || false
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false

        // Bot Prefix
        const prefix = '#'
        body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image' || type === 'video') && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const arg = body.substring(body.indexOf(' ') + 1)
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
        const url = args.length !== 0 ? args[0] : ''
        const uaOverride = process.env.UserAgent

        // [BETA] Avoid Spam Message
        if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        //
        if (!isCmd && !isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname)) }
        if (!isCmd && isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname), 'in', color(name || formattedTitle)) }
        if (isCmd && !isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        // [BETA] Avoid Spam Message
        msgFilter.addFilter(from)

        switch (command) {
            // Menu and TnC
            case 'corona':
                covid().then((result) => client.sendText(from, result))
                break
                
            case 'bot':
                await client.reply(from, 'kyaa dikkat hai bhai?🧐🧐')
                break

            case 'speed':
            case 'ping':
                await client.reply(from, `Pong!!!!\nSpeed: ${processTime(t, moment())} _Second_`)
                break

            case 'tnc':
                await client.sendText(from, menuId.textTnC())
                break

            case 'menu':
            case 'help':
                await client.sendText(from, menuId.textMenu(pushname))
                    .then(() => ((isGroupMsg) && (isGroupAdmins)) ? client.sendText(from, 'Menu Admin Group: *#menuadmin*') : null)
                break
            case 'menuadmin':
            case 'admin':
                if (!isGroupMsg) return client.reply(from, 'Sorry, bhai tu admin nahi hai😞', id)
                if (!isGroupAdmins) return client.reply(from, 'bhai tu admin nahi hai😞', id)
                await client.sendText(from, menuId.textAdmin())
                break
            case 'donate':
            case 'thanks':
                await client.sendText(from, menuId.textDonasi())
                break
            // Sticker Creator
            case 'sticker':
            case 'stickers':
            case 'stiker': {
                if ((isMedia || isQuotedImage) && args.length === 0) {
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                    const mediaData = await decryptMedia(encryptMedia, uaOverride)
                    const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                    client.sendImageAsSticker(from, imageBase64).then(() => {
                        client.reply(from, 'Ye lo tumhara sticker🤟')
                        console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                    })
                } else if (args[0] === 'nobg') {
                    /**
                    * This is Premium feature.
                    * Check premium feature at https://trakteer.id/red-emperor/showcase or chat Author for Information.
                    */
                    client.reply(from, 'itne paise me itna hi milega abhi🙄🙄', id)
                } else if (args.length === 1) {
                    if (!is.Url(url)) { await client.reply(from, 'Link galat hai bhai, direct link de mujhe😐😐', id) }
                    client.sendStickerfromUrl(from, url).then((r) => (!r && r !== undefined)
                        ? client.sendText(from, 'Sorry, Is link me koi image nahi hai bro🙄🙄')
                        : client.reply(from, 'Ye le, zee le apni zindagi🤟')).then(() => console.log(`Sticker Processed for ${processTime(t, moment())} Second`))
                } else {
                    await client.reply(from, 'rehne do beta, tumse na ho payega 😂😂', id)
                }
                break
            }
            case 'stikergif':
            case 'stickergif':
            case 'gifstiker':
            case 'gifsticker': {
                if (args.length !== 1) return client.reply(from, 'upload your gif on https://giphy.com/upload and then try with giphy link🙌', id)
                if (is.Giphy(url)) {
                    const getGiphyCode = url.match(new RegExp(/(\/|\-)(?:.(?!(\/|\-)))+$/, 'gi'))
                    if (!getGiphyCode) { return client.reply(from, 'Nahi mila bhai 😟', id) }
                    const giphyCode = getGiphyCode[0].replace(/[-\/]/gi, '')
                    const smallGifUrl = 'https://media.giphy.com/media/' + giphyCode + '/giphy-downsized.gif'
                    client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                        client.reply(from, 'Ye le aish kar')
                        console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                    }).catch((err) => console.log(err))
                } else if (is.MediaGiphy(url)) {
                    const gifUrl = url.match(new RegExp(/(giphy|source).(gif|mp4)/, 'gi'))
                    if (!gifUrl) { return client.reply(from, 'Nahi mila bhai 😟', id) }
                    const smallGifUrl = url.replace(gifUrl[0], 'giphy-downsized.gif')
                    client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                        client.reply(from, 'Ye le aish kar💃🏻💃🏻')
                        console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                    }).catch((err) => console.log(err))
                } else {
                    await client.reply(from, 'upload your gif on https://giphy.com/upload and then try with giphy link', id)
                }
                break
            }
            // Video Downloader
            case 'tiktok':
                if (args.length !== 1) return client.reply(from, 'Bhosdike tiktoker, nikal yaha se🤬🤬', id)
                if (!is.Url(url) && !url.includes('tiktok.com')) return client.reply(from, 'Galat link hai bhai😐', id)
                await client.reply(from, `_Abhi bhi bol raha hu tiktok chhor de😠😠_ \n\n${menuId.textDonasi()}`, id)
                downloader.tiktok(url).then(async (videoMeta) => {
                    const filename = videoMeta.authorMeta.name + '.mp4'
                    const caps = `*Metadata:*\nUsername: ${videoMeta.authorMeta.name} \nMusic: ${videoMeta.musicMeta.musicName} \nView: ${videoMeta.playCount.toLocaleString()} \nLike: ${videoMeta.diggCount.toLocaleString()} \nComment: ${videoMeta.commentCount.toLocaleString()} \nShare: ${videoMeta.shareCount.toLocaleString()} \nCaption: ${videoMeta.text.trim() ? videoMeta.text : '-'}`
                    await client.sendFileFromUrl(from, videoMeta.url, filename, videoMeta.NoWaterMark ? caps : `⚠ Videos without watermark are not available. \n\n${caps}`, '', { headers: { 'User-Agent': 'okhttp/4.5.0', referer: 'https://www.tiktok.com/' } }, true)
                        .then((serialized) => console.log(`Successfully sending files with id: ${serialized} processed during ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                }).catch(() => client.reply(from, 'Bhosdike tiktoker, nikal yaha se🤬🤬', id))
                break
            case 'ig':
            case 'instagram':
                if (args.length !== 1) return client.reply(from, 'ye to galat format hai but koi nahi you can follow this bot maker on IG: https://instagr.am/iam.rishabh', id)
                if (!is.Url(url) && !url.includes('instagram.com')) return client.reply(from, 'beta tumse na ho payega😂🤣', id)
                await client.reply(from, `_ruk video khoj raha hu🔎🔎_ \n\n${menuId.textDonasi()}`, id)
                downloader.insta(url).then(async (data) => {
                    if (data.type == 'GraphSidecar') {
                        if (data.image.length != 0) {
                            data.image.map((x) => client.sendFileFromUrl(from, x, 'photo.jpg', '', null, null, true))
                                .then((serialized) => console.log(`Successfully sending files with id: ${serialized} processed during ${processTime(t, moment())}`))
                                .catch((err) => console.error(err))
                        }
                        if (data.video.length != 0) {
                            data.video.map((x) => client.sendFileFromUrl(from, x.videoUrl, 'video.jpg', '', null, null, true))
                                .then((serialized) => console.log(`Successfully sending files with id: ${serialized} processed during ${processTime(t, moment())}`))
                                .catch((err) => console.error(err))
                        }
                    } else if (data.type == 'GraphImage') {
                        client.sendFileFromUrl(from, data.image, 'photo.jpg', '', null, null, true)
                            .then((serialized) => console.log(`Successfully sending files with id: ${serialized} processed during ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    } else if (data.type == 'GraphVideo') {
                        client.sendFileFromUrl(from, data.video.videoUrl, 'video.mp4', '', null, null, true)
                            .then((serialized) => console.log(`Successfully sending files with id: ${serialized} processed during ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                })
                    .catch((err) => {
                        console.log(err)
                        if (err === 'Not a video') { return client.reply(from, 'Nahi ho paya bhai link invalid hai😕😕.. but you can follow me on insta: https://instagr.am/iam.rishabh', id) }
                        client.reply(from, 'bhai only instagram reels download kar skta abhi main😥😥', id)
                    })
                break
            case 'twt':
            case 'twitter':
                if (args.length !== 1) return client.reply(from, 'Tumse na ho payega tum *#menu* dekho😂😂 ', id)
                if (!is.Url(url) & !url.includes('twitter.com') || url.includes('t.co')) return client.reply(from, 'Invalid link hai bhai😕😕', id)
                await client.reply(from, `_ruk jaa bhai video khoj raha hu🔍🔍_ \n\n${menuId.textDonasi()}`, id)
                downloader.tweet(url).then(async (data) => {
                    if (data.type === 'video') {
                        const content = data.variants.filter(x => x.content_type !== 'application/x-mpegURL').sort((a, b) => b.bitrate - a.bitrate)
                        const result = await urlShortener(content[0].url)
                        console.log('Shortlink: ' + result)
                        await client.sendFileFromUrl(from, content[0].url, 'video.mp4', `Link Download: ${result} \n\nProcessed for ${processTime(t, moment())} _Second_`, null, null, true)
                            .then((serialized) => console.log(`Successfully sending files with id: ${serialized} processed during ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    } else if (data.type === 'photo') {
                        for (let i = 0; i < data.variants.length; i++) {
                            await client.sendFileFromUrl(from, data.variants[i], data.variants[i].split('/media/')[1], '', null, null, true)
                                .then((serialized) => console.log(`Successfully sending files with id: ${serialized} processed during ${processTime(t, moment())}`))
                                .catch((err) => console.error(err))
                        }
                    }
                })
                    .catch(() => client.sendText(from, 'Koi media hi nahi hai is link me kaha se du? 😶😶'))
                break
            case 'fb':
            case 'facebook':
                if (args.length !== 1) return client.reply(from, 'Bhai pehle *#menu* dekh le 😒😒', id)
                if (!is.Url(url) && !url.includes('facebook.com')) return client.reply(from, '[Invalid Link]', id)
                await client.reply(from, `_Ruko thoda sabr karo.. video khojta hu🔍_ \n\n${menuId.textDonasi()}`, id)
                downloader.facebook(url).then(async (videoMeta) => {
                    const title = videoMeta.response.title
                    const thumbnail = videoMeta.response.thumbnail
                    const links = videoMeta.response.links
                    const shorts = []
                    for (let i = 0; i < links.length; i++) {
                        const shortener = await urlShortener(links[i].url)
                        console.log('Shortlink: ' + shortener)
                        links[i].short = shortener
                        shorts.push(links[i])
                    }
                    const link = shorts.map((x) => `${x.resolution} Quality: ${x.short}`)
                    const caption = `Text: ${title} \n\nLink Download: \n${link.join('\n')} \n\nProcessed for ${processTime(t, moment())} _Second_`
                    await client.sendFileFromUrl(from, thumbnail, 'videos.mp4', caption, null, null, true)
                        .then((serialized) => console.log(`Successfully sending files with id: ${serialized} processed during ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                })
                    .catch((err) => client.reply(from, `bhai thoda facebook ke sath problem hai abhi..🥺🥺`, id))
                break
            // Other Command
            case 'meme':
                if ((isMedia || isQuotedImage) && args.length >= 2) {
                    const top = arg.split('|')[0]
                    const bottom = arg.split('|')[1]
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const mediaData = await decryptMedia(encryptMedia, uaOverride)
                    const getUrl = await uploadImages(mediaData, false)
                    const ImageBase64 = await meme.custom(getUrl, top, bottom)
                    client.sendFile(from, ImageBase64, 'image.png', '', null, true)
                        .then((serialized) => console.log(`Successfully sending files with id: ${serialized} processed during ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                } else {
                    await client.reply(from, 'tumse na ho payega #menu dekh lo ek bar😂😂', id)
                }
                break

            case 'chut':
            case 'choot':
            case 'boobs':
            case 'pussy':
            case 'gandu':
            case 'gaandu':
            case 'ass':
            case 'loda':
            case 'lauda':
            case 'lawda':
                client.reply(from, 'Chala jaa bhosdike😒😒', id)
                break


            case 'porn':
            case 'pornhub':
            case 'dani':
                client.reply(from, 'Bade harami ho beta😏😏', id)
                break

            case 'sex':
            case 'fuck':
            case 'bsdk':
                client.reply(from, 'Saale sudhroge nahi, ye karne ke liye main hu yaha😑😑', id)
                break

            case 'mc':
            case 'bc':
            case 'sala':
            case 'chutiye':
            case 'chutiya':
                client.reply(from, 'Gaali sunna hai bot se?😑😑', id)
                break

            case 'share':
                client.reply(from, '❤️To start coversation with me click *https://wa.link/w3syjd* \n\n❤️To add me in your group *save my number and add me in your group*', id)
                break
            case 'yes':
            case 'haan':
            case 'han':
                client.reply(from, 'lodu Lalit🤣🤣', id)
                break
            case 'no':
            case 'nahi':
            case 'na':
            case 'nhi':
                client.reply(from, 'Good😆', id)
                break
              case 'resi':
                   if (args.length !== 2) return client.reply(from, 'Sorry, the message format is wrong, please check the menu. [Wrong Format]', id)
                   const kurirs = ['jne', 'pos', 'tiki', 'wahana', 'jnt', 'rpx', 'sap', 'sicepat', 'pcp', 'jet', 'dse', 'first', 'ninja', 'lion', 'idl', 'rex']
                   if (!kurirs.includes(args[0])) return client.sendText(from, `Maaf, jenis ekspedisi pengiriman tidak didukung layanan ini hanya mendukung ekspedisi pengiriman ${kurirs.join(', ')} Tolong periksa kembali.`)
                   console.log('Memeriksa No Resi', args[1], 'dengan ekspedisi', args[0])
                   cekResi(args[0], args[1]).then((result) => client.sendText(from, result))
                   break   


            case 'translate':
                if (args.length != 1) return client.reply(from, 'Sorry, the message format is wrong, please check the menu. [Wrong Format]', id)
                if (!quotedMsg) return client.reply(from, 'Sorry, the message format is wrong, please check the menu. [Wrong Format]', id)
                const quoteText = quotedMsg.type == 'chat' ? quotedMsg.body : quotedMsg.type == 'image' ? quotedMsg.caption : ''
                translate(quoteText, args[0])
                    .then((result) => client.sendText(from, result))
                    .catch(() => client.sendText(from, '[Error]'))
                break

            /*  case 'ceklok':
              case 'ceklokasi':
                  if (!quotedMsg || quotedMsg.type !== 'location') return client.reply(from, 'Sorry, the message format is wrong, please check the menu. [Wrong Format]', id)
                  console.log(`Request Status Zona Penyebaran Covid-19 (${quotedMsg.lat}, ${quotedMsg.lng}).`)
                  const zoneStatus = await getLocationData(quotedMsg.lat, quotedMsg.lng)
                  if (zoneStatus.kode !== 200) client.sendText(from, 'Maaf, Terjadi error ketika memeriksa lokasi yang anda kirim.')
                  let data = ''
                  for (let i = 0; i < zoneStatus.data.length; i++) {
                      const { zone, region } = zoneStatus.data[i]
                      const _zone = zone == 'green' ? 'Hijau* (Aman) \n' : zone == 'yellow' ? 'Kuning* (Waspada) \n' : 'Merah* (Bahaya) \n'
                      data += `${i + 1}. Kel. *${region}* Berstatus *Zona ${_zone}`
                  }
                  const text = `*CEK LOKASI PENYEBARAN COVID-19*\nHasil pemeriksaan dari lokasi yang anda kirim adalah *${zoneStatus.status}* ${zoneStatus.optional}\n\nInformasi lokasi terdampak disekitar anda:\n${data}`
                  client.sendText(from, text)
                  break */


            // Group Commands (group admin only)
            case 'kick':
                if (!isGroupMsg) return client.reply(from, 'Admin nahi hai bhai tu, Sorry😞', id)
                if (!isGroupAdmins) return client.reply(from, 'Admin nahi hai bhai tu, Sorry😞', id)
                if (!isBotGroupAdmins) return client.reply(from, 'Bhai pehle mujhe admin to bana🙄', id)
                if (mentionedJidList.length === 0) return client.reply(from, 'Galat format hai baba😐😐', id)
                if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Fir se kar bhai sahi format me🙄🙄', id)
                await client.sendTextWithMentions(from, `nikaal diya ${mentionedJidList.map(x => `@${x.replace('@c.us', '')}`).join('\n')} ko`)
                for (let i = 0; i < mentionedJidList.length; i++) {
                    if (groupAdmins.includes(mentionedJidList[i])) return await client.sendText(from, 'bhosdike admin ko hi nikaal de tu😂😂')
                    await client.removeParticipant(groupId, mentionedJidList[i])
                }
                break
            case 'promote':
                if (!isGroupMsg) return await client.reply(from, 'Admin nahi hai bhai tu, Sorry😞', id)
                if (!isGroupAdmins) return await client.reply(from, 'Admin nahi hai bhai tu, Sorry😞', id)
                if (!isBotGroupAdmins) return await client.reply(from, 'Bhai pehle mujhe admin to bana🙄', id)
                if (mentionedJidList.length != 1) return client.reply(from, 'ek ek karke bhai😒', id)
                if (groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Wo pehle se admin hai😒😒', id)
                if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Format galat hai bhai *#promote* @name type kar🙄🙄', id)
                await client.promoteParticipant(groupId, mentionedJidList[0])
                await client.sendTextWithMentions(from, ` @${mentionedJidList[0].replace('@c.us', '')} ab admin hai`)
                break
            case 'demote':
                if (!isGroupMsg) return client.reply(from, 'Admin nahi hai bhai tu, Sorry😞', id)
                if (!isGroupAdmins) return client.reply(from, 'Admin nahi hai bhai tu, Sorry😞', id)
                if (!isBotGroupAdmins) return client.reply(from, 'Bhai pehle mujhe admin to bana🙄', id)
                if (mentionedJidList.length !== 1) return client.reply(from, 'ek ek karke bhai😒', id)
                if (!groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Admin nahi hai wo😒😒', id)
                if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Format galat hai bhai *#demote* @name type kar🙄🙄', id)
                await client.demoteParticipant(groupId, mentionedJidList[0])
                await client.sendTextWithMentions(from, `hata diya @${mentionedJidList[0].replace('@c.us', '')} ko admin se`)
                break
            case 'bye':
                if (!isGroupMsg) return client.reply(from, 'Admin nahi hai bhai tu😜😜', id)
                if (!isGroupAdmins) return client.reply(from, 'Admin nahi hai bhai tu😂😂', id)
                client.sendText(from, 'Bhaga diye naa.. jaa raha hu😭😭').then(() => client.leaveGroup(groupId))
                break
            case 'del':
                if (!isGroupAdmins) return client.reply(from, 'Admin nahi hai bhai tu🤣🤣', id)
                if (!quotedMsg) return client.reply(from, 'Format galat hai bhai message pe reply kar ke bol🙄🙄', id)
                if (!quotedMsgObj.fromMe) return client.reply(from, 'Format galat hai bhai message pe reply kar ke bol🙄🙄', id)
                client.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
                break
            case 'tagall':
            case 'everyone':
                /**
                * This is Premium feature.
                * Check premium feature at https://trakteer.id/red-emperor/showcase or chat Author for Information.
                */
                client.reply(from, 'free me ye nahi milega🤭', id)
                break
            case 'botstat': {
                const loadedMsg = await client.getAmountOfLoadedMessages()
                const chatIds = await client.getAllChatIds()
                const groups = await client.getAllGroups()
                client.sendText(from, `Status :\n- *${loadedMsg}* Loaded Messages\n- *${groups.length}* Group Chats\n- *${chatIds.length - groups.length}* Personal Chats\n- *${chatIds.length}* Total Chats`)
                break
            }
            default:
                client.reply(from, 'Galat command hai bhai, *#menu* type krle, list ke liye😒😒', id)
                console.log(color('[ERROR]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Unregistered Command from', color(pushname))
                break
        }
    } catch (err) {
        console.error(color(err, 'red'))
    }
}
