import * as dotenv from 'dotenv'
import { sbbAuthTree } from './apiTrees';
dotenv.config()


// string key chaining
export type PathTree = {
    
    [index :  string]: {
        url:string;
        key?: string;
        children?: PathTree[]
    }
}

export type ExtractKeys<T extends PathTree, K extends keyof T> = 
    {[P in keyof T[K]['children'][number]]: ExtractKeys<T[K]['children'][number], P>}

export type PathKeys<T> = T extends object ? { [K in keyof T]:
    `${Exclude<K, symbol>}${"" | `.${PathKeys<T[K]>}`}`
  }[keyof T] : never

export function getUrl<
    T extends PathTree, 
    K extends keyof T>(
        tree: T, 
        str: PathKeys<ExtractKeys<T, K>>, 
        ) {
    if(!str || !tree.base.url) return ''
    const points = str.split('.')
    const resultArray = [tree.base.url,]
    let current = tree.base

    points.forEach((item) => {
        if(current?.children){
            const hasItem = current.children.find(child => child[item]);
            if(hasItem) {
                current = hasItem[item]
                resultArray.push(current.url);
            }
        } else{
            resultArray.push (current[item]?.url)
        }
    })
    return resultArray.join('')
} 

getUrl(sbbAuthTree, '')













