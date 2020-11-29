require('dotenv').config()
const { decryptMedia, Client } = require('@open-wa/wa-automate')
const axios = require('axios')
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Kolkata').locale('id')
const { downloader, removebg, meme, translate, covid } = require('../../lib')
const { msgFilter, color, processTime, is } = require('../../utils')
const { uploadImages } = require('../../utils/fetcher')


const { menuId } = require('./text')

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
        if (!isCmd && !isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname)) }
        if (!isCmd && isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname), 'in', color(name || formattedTitle)) }
        if (isCmd && !isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        // [BETA] Avoid Spam Message
        msgFilter.addFilter(from)

        switch (command) {
            // Menu and TnC

            case 'corona':
            case 'covid':
                covid().then((result) => client.sendText(from, result))
                break


            case 'howtoimpressher':
                client.reply(from, 'nahi degi🤣🤣', id)
                break
            
            case 'howtoimpresshim':
                client.reply(from, 'nahi dega🤣🤣', id)
                break
            
            case 'slap':
                arg = body.trim().split(' ')
                const person = author.replace('@c.us', '')
                await client.sendGiphyAsSticker(from, 'https://bolojawan.com/wp-content/uploads/2017/08/giphy-2.gif')
                client.sendTextWithMentions(from, '@' + person + ' *slapped* ' + arg[1])
                break  
            
            case 'abuse':
                //arg = body.trim().split(' ')
                const months = ["January", "February", "March", "April", "May", "June", "July"];
                const random1 = Math.floor(Math.random() * months.length);
               // const person = author.replace('@c.us', ''))
                client.sendText(from, months[random1])
                break

            case 'sendnudes':
                const response = await axios.get('https://meme-api.herokuapp.com/gimme/adorableporn');
                const { title, url } = response.data
                await client.sendFileFromUrl(from, `${url}`, 'nudes.jpg', `${title}`)
                break

            case 'meme':
                try {
                    const response1 = await axios.get('https://meme-api.herokuapp.com/gimme/IndianDankMemes');
                    const { url } = response1.data
                    await client.sendFileFromUrl(from, `${url}`, 'meme.jpg')
                } catch (err) {
                    console.log(err)
                }
                break

            case 'bot':
            case 'hi':
                client.reply(from, 'kyaa dikkat hai bhai?🧐🧐', id)
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
            case 'thankyou':
            case 'iloveyou':
            case 'ok':
            case 'love':
            case 'rishabh':
                await client.sendText(from, menuId.textDonasi())
                break

            case 'animate':
                if (isMedia) {
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const mediaData = await decryptMedia(encryptMedia, uaOverride)
                    client.sendVideoAsGif(from, mediaData)
                }
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
                client.reply(from, 'Bhosdike tiktoker, nikal yaha se🤬🤬', id)
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

            case 'makememe':
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
            case 'sunny':
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

            case 'add':
            case 'feedback':
                client.reply(from, 'If you want your commands to be added in the bot write it here and i will add it: https://bit.ly/wa-stickerbot', id)
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


            case 'botstat': {
                const loadedMsg = await client.getAmountOfLoadedMessages()
                const chatIds = await client.getAllChatIds()
                const groups = await client.getAllGroups()
                client.sendText(from, `Status :\n- *${loadedMsg}* Loaded Messages\n- *${groups.length}* Group Chats\n- *${chatIds.length - groups.length}* Personal Chats\n- *${chatIds.length}* Total Chats`)
                break

            }
            default:
                client.sendStickerfromUrl(from, 'https://i.imgur.com/N6uXNpD.png', 'test.png', id)
                console.log(color('[ERROR]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Unregistered Command from', color(pushname))
                break
        }
    } catch (err) {
        console.error(color(err, 'red'))
    }
}
