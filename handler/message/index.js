require('dotenv').config()
const { decryptMedia, Client } = require('@open-wa/wa-automate')
const axios = require('axios')
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Kolkata').locale('id')
const { downloader, meme, translate, covid } = require('../../lib')
const { msgFilter, color, processTime, is } = require('../../utils')
const { uploadImages } = require('../../utils/fetcher')
const { RemoveBgResult, removeBackgroundFromImageBase64, removeBackgroundFromImageFile } = require('remove.bg')
const fs = require('fs-extra')


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

            case 'list':
                client.reply(from, '*New Commands:* #howtoimpressher, #howtoimpresshim, #abuse @name, #sun, #mc, #say _your word_, #meme, #cheems, #kiss @name and some 18+ commands of those who requested😉😉 ')
                break

            case 'howtoimpressher':
                client.reply(from, 'nahi degi🤣🤣', id)
                break

            case 'howtoimpresshim':
                client.reply(from, 'nahi dega🤣🤣', id)
                break

            case 'botop':
                client.reply(from, 'isi baat pe coffee pila de: https://buymeacoffee.com/rishabh053', id)
                break

            case 'cheems':
                client.reply(from, 'Hemlo emveryone👋👋', id)
                break

            case 'sun':
                client.reply(from, 'bol lavde🤣🤣', id)
                break

            case 'say':
                const sayWord = body.slice(5)
                if (args.length < 1) return client.reply(from, 'Kyaa bolu bhai?🧐🧐', id)
                client.reply(from, `${sayWord}`, id)
                break

            case 'alu':
                client.sendStickerfromUrl(from, 'https://i.imgur.com/w80GYvf.png', 'alu.png', id)
                break

            case 'sexy':
                client.reply(from, 'Wo to main hu hi🤣🤣', id)
                break


            case 'abuse':
                const list1 = ["Chipkali ke jhaat ke paseene", "Apni gaand mein muthi daal", "Chut ka bhoot", "tere gaand main danda", "Lavde ke baal", "nahi dunga tumhe gaali", "bhai hai mera", "tujhe nhi dunga gaali tu bhai hai", "Teri maa ki chut", "Teri gaand main kute ka lund",
                 "Lund Ke Pasine", "Gaand ke khatmal", "nahi deta gaali main", "i love you","Bhosdike", "Madarchod", "Bhen ke takke","Saala kutta", "Kamina", "Kamini", "Kutta", "Kuttiya", "Chakka","Hijra","Chullu bhar muth mein doob mar", "Gadha", "Tatti", "Bhadwe", "Hazaar lund teri gaand main",
                 "Kutte ke poot, teri maa ki choot","Teri maa ka bhosda", "Bol teri gand kaise maru", "Saale", "Chutiye", "Betichod", "Behenchod", "Bhen ke lode", "Jhat ke baal", "Chodu", "Gandu", "Gand ke aandhe", "Saale mutthal", "Jhaatu", "Chipkali ke jhaat ke baal", "Kitna Gaali Dilwayega Bhai"];
                const random1 = Math.floor(Math.random() * list1.length);
                if (mentionedJidList.length === 0) return client.reply(from, 'Kisko gaali deni hai bolo🤬🤬', id)
                if (mentionedJidList[0] === botNumber) return await client.reply(from, 'khud ko gaali nahi deta main😎😎', id)
                else {
                    await client.sendTextWithMentions(from, `${list1[random1]} @${mentionedJidList[0].replace('@c.us', '')}`, id)
                }
                break

            case 'sendnudes':
            case 'nudes':
                try {
                    const subreddits = ['IndiansGoneWild', 'adorableporn', 'gonewild', 'Nude_Selfie', 'legalteens', 'pussy', 'ratemyboobs']
                    const randSub = subreddits[Math.random() * subreddits.length | 0]
                    const response = await axios.get('https://meme-api.herokuapp.com/gimme/' + randSub);
                    const { title, url } = response.data
                    await client.sendFileFromUrl(from, `${url}`, 'nudes.jpg', `${title}`)
                } catch (err) {
                    console.log(err)
                }
                break

            case 'dick':
            case 'dickpic':
            case 'sins':
            case 'jhonny':
                try {
                    const response2 = await axios.get('https://meme-api.herokuapp.com/gimme/penis');
                    const { title, url } = response2.data
                    await client.sendFileFromUrl(from, `${url}`, 'nudes.jpg', `${title}`)
                } catch (err) {
                    console.log(err)
                }
                break

            case 'meme':
                try {
                    const subreddits1 = ['dankinindia', 'IndianMeyMeys', 'indiameme', 'IndianDankMemes']
                    const randSub1 = subreddits1[Math.random() * subreddits1.length | 0]
                    const response1 = await axios.get('https://meme-api.herokuapp.com/gimme/' + randSub1);
                    const { url } = response1.data
                    await client.sendFileFromUrl(from, `${url}`, 'meme.jpg')
                } catch (err) {
                    console.log(err)
                }
                break

            case 'bot':
            case 'hi':
                const bot = ["Kyaa problem hai bhai🤓🤓", "Bol na bhai🤗🤗", "Tumlog saale slow kr dete mujhe😒😒", "Spam mat kr bsdk😒", "Bolo kyaa kaam hai🥺", "Tabiyat kharab hai meri🤢", "Nahi degi bhai😪😪", "Hukum mere aaka🤭", "Pareshan kar diye ho🙄🙄", "Nahi dunga reply😏😏", "Haan👄", "🤦‍♂️🤦‍♂️🤦‍♂️", "I am ded👻👻"];
                const random2 = Math.floor(Math.random() * bot.length);
                await client.reply(from, `${bot[random2]}`, id)
                break

            case 'kiss':
                const giphylinks = ["https://media.giphy.com/media/l2Je2M4Nfrit0L7sQ/giphy-downsized.gif", "https://media.giphy.com/media/3o7qDVQ2GrFAf1MVgc/giphy-downsized.gif", "https://media.giphy.com/media/RW4Vf0698oX3W/giphy-downsized.gif",
                    "https://media.giphy.com/media/wf4UuPMYnwBck/giphy-downsized.gif", "https://media.giphy.com/media/plsoC32RpEngk/giphy-downsized.gif", "https://media.giphy.com/media/2stFpADPSpfQQ/giphy-downsized.gif", "https://media.giphy.com/media/nxNwAJqEty4py/giphy-downsized.gif",
                    "https://media.giphy.com/media/Vr115pWzOnMtO/giphy-downsized.gif", "https://media.giphy.com/media/Qz6TS5AZVbWFi/giphy-downsized.gif", "https://media.giphy.com/media/8FGvwxpd9rrvW/giphy-downsized.gif"];
                const GiphyRandom = Math.floor(Math.random() * giphylinks.length);
                const kissurl = giphylinks[GiphyRandom];
                client.sendGiphyAsSticker(from, kissurl).then(() => {
                    client.sendTextWithMentions(from, `Kissed @${mentionedJidList[0].replace('@c.us', '')}`, id)
                    console.log(`Kisssed In ${processTime(t, moment())} Second`)
                }).catch((err) => console.log(err))
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
                if ((isMedia || isQuotedImage) && args.length === 0) {
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                    const mediaData = await decryptMedia(encryptMedia, uaOverride)
                    const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                    client.sendMp4AsSticker(from, imageBase64).then(() => {
                        client.reply(from, 'Ye dekh jaadoo🌟🌟')
                        console.log(`Animated Sticker Processed for ${processTime(t, moment())} Second`)
                    })
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
                    try {
                        var encryptMedia = isQuotedImage ? quotedMsg : message
                        var _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                        var mediaData = await decryptMedia(encryptMedia, uaOverride)
                        var imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                        var base64img = imageBase64
                        var outFile = '././img/noBg.png'
                        var result = await removeBackgroundFromImageBase64({ base64img, apiKey: 'mLPH7dsZbkacRjrsAJ32pcio', size: 'auto', type: 'auto', outFile })
                        await fs.writeFile(outFile, result.base64img)
                        await client.sendImageAsSticker(from, `data:${mimetype};base64,${result.base64img}`)
                    } catch (err) {
                        console.log(err)
                    }
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
            case 'lund':
            case 'naked':
                const adult = ["Chala jaa bhosdike😒😒", "Padhai pe dhyan do IAS-YAS bano😆😆", "Yehi sab message kro mujhe bsdk😒😒", "porn dekh le bsdk😒", "nahi degi beta😂😂", "Saans toh lene de be🤢", "Meri shaktiyo ka galat istmaal ho raha😪😪", "Aisa keech ke lafa dunga😂😂", "Abey Saale🙄🙄", "Bahot tez ho gaye ho😏😏", "Hila le bsdk😂😂", "I am ded👻👻"];
                const rand = Math.floor(Math.random() * adult.length);
                await client.reply(from, `${adult[rand]}`, id)
                break


            case 'porn':
            case 'pornhub':
            case 'dani':
            case 'sunny':
            case 'mia':
            case 'sendboobs':
            case 'sendboob':
            case 'sendpussy ':
            case 'nude':
                const adult2 = ["Porn dekh le na😒😒", "Kon hai ye log😆", "Bura lagta hai bhai😒", "Saabhash! beta😒", "Waaah", "Tu virgin hi marega😜😜", "Chillao mat attack aa jayega", "Koi sense hai is baat ki🤨🤨", "Ise kehte hai angrez🤣🤣", "Hila le bsdk😂😂", "Paisa barbaad behcho😣😣"];
                const random4 = Math.floor(Math.random() * adult2.length);
                await client.reply(from, `${adult2[random4]}`, id)
                break

            case 'sex':
            case 'fuck':
            case 'bsdk':
                const adult1 = ["Beta padh le thoda😒😒", "Chup kar bhosdike😆😆", "Kya chod failaya hai idhar😒😒", "porn dekh le bsdk😒", "Ye koi ramdikhana hai😡😡", "Aao kabhi haveli pe😜😜", "mujhe chakkar aa raha hai😪😪", "Teri wajah se mera atmhatya karne ka time aa gya hai🤨🤨", "Abey Saale🙄🙄", "Aye tu chup re😏", "Hila le bsdk😂😂", "Paisa barbaad behcho😣😣"];
                const random3 = Math.floor(Math.random() * adult1.length);
                await client.reply(from, `${adult1[random3]}`, id)
                break

            case 'mc':
            case 'madarchod':
            case 'madharchod':
            case 'bc':
            case 'behnchod':
                const bcgal = ["Saala behnchod😒😒", "Duinya hi mc hai vro😆", "Nikal yaha se😒", "Admin isko nikalo group se😒", "Baat nhi kr raha main tere se😒", "😭😭😭", "Calling Police🤨", "Same to you🤣🤣", "😣😣"];
                const randomgal = Math.floor(Math.random() * bcgal.length);
                await client.reply(from, `${bcgal[randomgal]}`, id)
                break

            case 'saala':
            case 'sala':
            case 'chutiye':
            case 'chutiya':
                const sala = ["Tu chutiya sala😒😒", "Hum sab hi chutiye hai bhai😆", "Chup kr chutiye😒", "Saabhash! beta😒", "Gaali dene ke liye add kiye ho?😒", "😭😭😭", "Saale block maar dunga🤨", "Chup hoja bhosdike🤣🤣", "Paisa barbaad behcho😣😣"];
                const randomsl = Math.floor(Math.random() * sala.length);
                await client.reply(from, `${sala[randomsl]}`, id)
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
            case 'remove':    
                if (!isGroupMsg) return client.reply(from, 'Admin nahi hai bhai tu, Sorry😞', id)
                if (!isGroupAdmins) return client.reply(from, 'Admin nahi hai bhai tu, Sorry😞', id)
                if (!isBotGroupAdmins) return client.reply(from, 'Bhai pehle mujhe admin to bana🙄', id)
                if (mentionedJidList.length === 0) return client.reply(from, 'Galat format hai baba😐😐', id)
                if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Mujhe hi nikaaloge saale🙄🙄', id)
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
                if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Kabhi kahbhi lagta hai apun hi bhagwaan hai', id)
                await client.promoteParticipant(groupId, mentionedJidList[0])
                await client.sendTextWithMentions(from, ` @${mentionedJidList[0].replace('@c.us', '')} ab admin hai`)
                break

            case 'demote':
                if (!isGroupMsg) return client.reply(from, 'Admin nahi hai bhai tu, Sorry😞', id)
                if (!isGroupAdmins) return client.reply(from, 'Admin nahi hai bhai tu, Sorry😞', id)
                if (!isBotGroupAdmins) return client.reply(from, 'Bhai pehle mujhe admin to bana🙄', id)
                if (mentionedJidList.length !== 1) return client.reply(from, 'ek ek karke bhai😒', id)
                if (!groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Admin nahi hai wo😒😒', id)
                if (mentionedJidList[0] === botNumber) return await client.reply(from, 'mujhe hi demote karoge🙄🙄', id)
                await client.demoteParticipant(groupId, mentionedJidList[0])
                await client.sendTextWithMentions(from, `hata diya @${mentionedJidList[0].replace('@c.us', '')} ko admin se`)
                break
            case 'bye':
                if (!isGroupMsg) return client.reply(from, 'Admin nahi hai bhai tu😜😜', id)
                if (!isGroupAdmins) return client.reply(from, 'Admin nahi hai bhai tu😂😂', id)
                client.sendText(from, 'Bhaga diye naa.. jaa raha hu😭😭').then(() => client.leaveGroup(groupId))
                break


            case 'botstat':
            case 'botstats': {
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
