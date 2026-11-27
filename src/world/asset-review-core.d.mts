export type Point={x:number;y:number};
export type Item={id:string;x:number;y:number;type:string};
export type Bridge={kind:string;x:number;y:number;w:number;h:number};
export type Layout={width:number;height:number;items:Item[];bridges:Bridge[];spawn:Point;blocked(x:number,y:number,open?:boolean):boolean};
export const TILE:number;
export const SEASONS:string[];
export function makeLayout(scene?:string,seed?:number):Layout;
export function move(layout:Layout,x:number,y:number,dx:number,dy:number,open?:boolean):Point;
