exports.textTnC = () => {
    return `
By using this bot you accept that you are not involved in:
        • sex / human trafficking
        • gambling
        • harmful addictive behavior
        • crime
        • violence 
        • forest burning / deforestation
        • hate speech or discrimination based on age, sex, gender identity, race, sexuality, religion, nationality
    
Best regards, Rishabh.`
}

exports.textMenu = (pushname) => {
    return `
Hi, ${pushname || ''}! 👋️
Here are some of the features of this bot! ✨

Sticker Maker:

1. *#sticker*
To convert an image into a sticker, send the image with the caption #sticker or reply to the image that has been sent with #sticker.

2. *#sticker* _<Image Url>_
To change the image from the url to a sticker.

3. *#gifsticker* _<Giphy URL>_ / *#stickergif* _<Giphy URL>_
To turn a gif into a sticker (upload your GIF on giphy.com/upload and share the link)

Downloader (Only Videos)

1. *#tiktok* _<post / video url>_
Will return video tiktok.

2. *#fb* _<post / video url>_
Will return the Facebook video download link.

3. *#ig* _<post / video url>_
Will return the Instagram video download link.

4. *#twt* _<post / video url>_
Will return the Twitter video download link.

5. *#tnc*
Displays Bot Terms and Conditions.

6. *#share*
Share this bot with your Group and Friends

7. *#meme* _<upper text>_ | _<lower text>_
Will Return the Meme with your text 

☕ _https://buymeacoff.ee/rishabh053_
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
If you enjoyed this bot consider buying me a coffee
☕_https://buymeacoff.ee/rishabh053_

You can follow this bot maker on Instagram
❤️https://instagr.am/iam.rishabh

Thank you.`
}
