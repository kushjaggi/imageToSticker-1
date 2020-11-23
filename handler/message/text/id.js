exports.textTnC = () => {
    return `
    Source code / bot is an open-source program (free) written using Javascript, you can use, copy, modify, combine, publish, distribute, sub-license, and or sell copies without removing the main author of this source code / bot.

    By using this source code / bot, you agree to the following Terms and Conditions:
    - Source code / bot does not store your data on our servers.
    - The source code / bot is not responsible for the stickers you make from this bot and the videos, images and other data that you get from the source code / bot.
    - Source code / bot may not be used for services that aim / contribute to:
        • sex / human trafficking
        • gambling
        • harmful addictive behavior
        • crime
        • violence (unless necessary to protect public safety)
        • forest burning / deforestation
        • hate speech or discrimination based on age, sex, gender identity, race, sexuality, religion, nationality
    
    Best regards, Rishabh .`
}

exports.textMenu = (pushname) => {
    return `
Hi, ${pushname || ''}! 👋️
Here are some of the features of this bot! ✨

Sticker Maker:
1. *#sticker*
To convert an image into a sticker, send the image with the caption #sticker or reply to the image that has been sent with #sticker.

2. *#stickers* _<Image Url>_
To change the image from the url to a sticker.

3. *#gifsticker* _<Giphy URL>_ / *#stickergif* _<Giphy URL>_
To turn a gif into a sticker (Giphy only)

Downloader(Only Videos)
1. *#tiktok* _<post / video url>_
Will return video tiktok.

2. *#fb* _<post / video url>_
Will return the Facebook video download link.

3. *#ig* _<post / video url>_
Will return the Instagram video download link.

4. *#twt* _<post / video url>_
Will return the Twitter video download link.

Etc:
1. *#tnc*
Displays Bot Terms and Conditions.

https://www.buymeacoffee.com/rishabh053
Hope you have a great day!✨`

}

exports.textAdmin = () => {
    return `
⚠ [ *Admin Group Only* ] ⚠ 
Here are some of the group admin features included in this bot!

1. *#kick* @user
To remove members from the group (can be more than 1).

2. *#promote* @user
To promote members to group admins.

3. *#demote* @user
To demote Group admins.

4. *#del*
To delete a bot message (reply bot message with #del) `
}

exports.textDonasi = () => {
    return `

    Hi, thank you for using this bot, to support this bot you can help by donating via the following link:
    https://www.buymeacoffee.com/rishabh053
    The donation will be used for the development and operation of this bot.
    
    Thank you.`
}
