import { PathTree } from "./sbbApiEndpoints"

export const sbbAuthTree = {
    base: {
        url: process.env.SB_ID_BASE_URL,
        children:[
            {
                auth: {
                    url: '/ic/sso/api/v2/oauth',
                    children: [
                        {
                            authorize: {
                                url: '/authorize'
                            }
                        },
                        {
                            token: {
                                url:'/token'
                            }
                        },
                        {
                            clientInfo: {
                                url: '/user-info'
                            }
                        }
                    ]
                },
            },
        ]
    }
} 

export const sbbFintechTree = {
    base: {
        url: process.env.SB_FINTECH_BASE_URL,
        children: [
            {
                clientInfo: {
                    url: '/v1/client-info' 
                }
            },
        ]
    }
}