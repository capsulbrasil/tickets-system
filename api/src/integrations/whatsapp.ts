import { Result } from 'aeria';
import * as fs from 'fs'

const {
    ZAPMEOW_CHECK_USER_URL,
    ZAPMEOW_SEND_TEXT_URL,
    ZAPMEOW_SEND_IMAGE_URL
} = process.env

async function checkUserPhone(phoneNumber:string): Promise<false|string> {
    const checkPhone = await fetch(ZAPMEOW_CHECK_USER_URL,{
        method:'POST',
        body:JSON.stringify({phones:[phoneNumber]})
    })
    
    const phoneResponse = await checkPhone.json()
    
    if(phoneResponse.phones.length === 0){
        return false
    }
    if (!phoneResponse.phones[0].is_registered){
        return false
    }
    return phoneResponse.phones[0].phone
}

export const whatsappMessage = (async (phoneNumber:string, message:string,  mediaPathArray?:string[]) => {
    const phoneResponse = await checkUserPhone(phoneNumber)
    let imageResponse = ''
    
    if (phoneResponse === false){
        return Result.error("PHONE_NOT_REGISTERED")
    }
    
    if (mediaPathArray){
        for(const mediaPath of mediaPathArray){
            const base64image = fs.readFileSync(mediaPath, 'base64')
            const sendImage = await fetch(ZAPMEOW_SEND_IMAGE_URL,{
                method:'POST',
                body:JSON.stringify({phone:phoneResponse,base64:"data:image/png;base64,"+base64image})
            })
            imageResponse = await sendImage.text()
        }
        
    }
    
    const sendText = await fetch(ZAPMEOW_SEND_TEXT_URL,{
        method:'POST',
        body:JSON.stringify({phone:phoneResponse,text:message})
    })
    const textResponse = await sendText.text()
    
    return Result.result({text:textResponse, image:imageResponse})
})