export type PathTree = {
    [index: string]: {
        url:string;
        children?: PathTree[]
    }
}