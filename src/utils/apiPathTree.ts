
export type PathTree = {
    [index: string]: {
        url:string;
        children?: PathTree[]
    }
}

const sbbAuthTree = {
    base: {
        url: '/some/url',
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
                                url: '/client-info'
                            }
                        }
                    ]
                }
            }
        ]
    }
}

/**
 * The function takes a string and a tree structure as input, and returns a URL based on the string's
 * path in the tree.
 * @param {string} str - The `str` parameter is a string representing a path in the tree structure.
 * @param {PathTree} tree - The `tree` parameter is an object representing a tree structure. It has a
 * property called `base` which represents the root node of the tree. The `base` node has a property
 * called `url` which represents the URL associated with the root node.
 * @returns a string, which is the concatenation of the URLs found in the given path string (str) based
 * on the provided tree structure (tree).
 */

export function getSbbUrl(str: string, tree: PathTree = sbbAuthTree){
    if(!str || !tree.base.url) return ''
    const points = str.split('.')
    const resultArray = [tree.base.url,]
    let current = tree.base
    if(!current) return ''

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