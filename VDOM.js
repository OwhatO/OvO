import Model, { ArrayModel, } from 'https://oxo.fenzland.com/OmO/0.1/Model.js';
import TextNode from './TextNode.js';
import Listener from './Listener.js';
import ITemplate from './ITemplate.js';

const NAME= Symbol( 'NAME', );
const NAMESPACE= Symbol( 'NAMESPACE', );
const ARRANGE_ARGS= Symbol( 'ARRANGE_ARGS', );
const CHILDREN= Symbol( 'CHILDREN', );
const ATTRIBUTES= Symbol( 'ATTRIBUTES', );
const LISTENERS= Symbol( 'LISTENERS', );
const SET_ATTRIBUTE= Symbol( 'SET_ATTRIBUTE', );
const APPEND_LISTENER= Symbol( 'APPEND_LISTENER', );
const DOM_PROCESSOR= Symbol( 'DOM_PROCESSOR', );
const EMPTY= Symbol( 'EMPTY', );
const DOM= Symbol( 'DOM', );

export default class VDOM
{
	constructor( name, namespace=undefined, )
	{
		this[NAME]= name;
		this[NAMESPACE]= namespace;
		this[CHILDREN]= [];
		this[ATTRIBUTES]= new Map;
		this[LISTENERS]= [];
		this[EMPTY]= false;
	}
	
	fill( ...args )
	{
		const argsTable= this.constructor.arrangeArgs( args, );
		
		for( let child of argsTable.children )
			this.appendChild( child, );
		
		for( let listener of argsTable.listeners )
			this[APPEND_LISTENER]( listener, );
		
		for( let attr in argsTable.attributes )
			if( attr === 'class' )
				this.setClass( argsTable.attributes[attr], );
			else
			if( attr === 'style' )
				this.setStyle( argsTable.attributes[attr], );
			else
				this.setAttribute( attr, argsTable.attributes[attr], );
		
		return this;
	}
	
	appendChild( child, )
	{
		this[CHILDREN].push( child, );
	}
	
	setNamespace( namespace, )
	{
		this[NAMESPACE]= namespace;
	}
	
	setClass( value, )
	{
		if( value instanceof ArrayModel )
		{
			const className= value.valueOf().join( ' ', );
			
			this[ATTRIBUTES].set( 'class', className, );
			
			if( this[DOM] )
				this[DOM].className= className;
			
			value.observedBy( ( i, x, r, )=> {
				
				this[ATTRIBUTES].set( 'class', value.valueOf().join( ' ', ), );
				
				if( this[DOM] )
				{
					if( x )
						this[DOM].classList.add( x, );
					else
						this[DOM].classList.remove( r, );
				}
			}, )
		}
		else
		if( value instanceof Model )
		{
			this[ATTRIBUTES].set( 'class', value.valueOf(), );
			
			value.observedBy( v=> this[DOM] && (this[DOM].className= v), true, );
		}
		else
		if( Array.isArray( value, ) )
		{
			const className= value.join( ' ', );
			
			this[ATTRIBUTES].set( 'class', className, );
			
			if( this[DOM] )
				this[DOM].className( className, );
		}
		else
		{
			this[ATTRIBUTES].set( 'class', value, );
			
			if( this[DOM] )
				this[DOM].className( value, );
		}
	}
	
	setStyle( value, )
	{
		if( value && value.constructor === Object )
		{
			this[SET_ATTRIBUTE]( 'style', Object.entries( value, ).map( ( [ k, v, ], )=> `${k}:${v};`, ).join( '', ), );
			
			for( let k in value )
			{
				if( value[k] instanceof Model )
					value[k].observedBy( v=> {
						if( this[DOM] )
							this[DOM].style.setProperty( k, v, );
					}, );
			}
		}
		else
		if( value instanceof Model && value.IS_OBJECT )
			;
		else
			this[SET_ATTRIBUTE]( 'style', value, );
	}
	
	setAttribute( attr, value=true, )
	{
		if( value instanceof Model )
		{
			this[SET_ATTRIBUTE]( attr, value.valueOf(), );
			value.observedBy( v=> this[SET_ATTRIBUTE]( attr, v, ), );
		}
		else
			this[SET_ATTRIBUTE]( attr, value, );
	}
	
	getAttribute( attr, )
	{
		return this[ATTRIBUTES].get( attr, );
	}
	
	addDOMProcessor( processor, )
	{
		this[DOM_PROCESSOR]= processor;
	}
	
	addListener( eventName, callback, )
	{
		this[APPEND_LISTENER]( new Listener( eventName, callback, ), )
	}
	
	[SET_ATTRIBUTE]( attr, value=true, )
	{
		if( value === true )
			value= attr;
		
		this[ATTRIBUTES].set( attr, value, );
		
		if( this[DOM] )
			if( value === false )
				this[DOM].removeAttribute( attr, );
			else
				this[DOM].setAttribute( attr, value, );
	}
	
	[APPEND_LISTENER]( listener, )
	{
		this[LISTENERS].push( listener, );
	}
	
	toHTML()
	{
		let str= '<'+this[NAME];
		
		for( let [ attr, value, ] of this[ATTRIBUTES] )
			str+= ` ${attr}="${value}"`;
		
		if( this.isEmpty )
			str+= ' />';
		else
		{
			str+= '>';
			str+= this[CHILDREN].map( x=> x.toHTML() ).join( '', );
			str+= `</${this[NAME]}>`;
		}
		
		return str;
	}
	
	toDOM( document, )
	{
		if( this[DOM] )
			return [ this[DOM], ];
		else
			return this.freshDOM( document, );
	}
	
	freshDOM( document, )
	{
		const dom= (
			this[NAMESPACE]
			? document.createElementNS( this[NAMESPACE], this[NAME])
			: document.createElement( this[NAME], )
		);
		
		this[DOM]= dom;
		
		for( let [ attr, value, ] of this[ATTRIBUTES] )
			dom.setAttribute( attr, value, );
		
		for( let listener of this[LISTENERS] )
			listener.listenTo( dom, );
		
		for( let child of this[CHILDREN] )
			for( let childDom of child.toDOM( document, ) )
				dom.appendChild( childDom, );
		
		if( this[DOM_PROCESSOR] )
			this[DOM_PROCESSOR]( dom, );
		
		return [ dom, ];
	}
	
	empty()
	{
		this[EMPTY]= true;
		
		return this;
	}
	
	get children()
	{
		return this[CHILDREN];
	}
	
	get isEmpty()
	{
		return this[EMPTY];
	}
	
	static create( name, ...args )
	{
		return new VDOM( name, ).fill( ...args, );
	}
	
	static createNS( namespace, name, ...args )
	{
		return new VDOM( name, namespace, ).fill( ...args, );
	}
	
	static forEach( vdoms, callback, )
	{
		if( Array.isArray( vdoms, ) )
			VDOM.create( '', ...vdoms ).children.forEach( x=> callback( x, ), );
		else
			callback( vdoms, );
	}
	
	static arrangeArgs( args, )
	{
		return this[ARRANGE_ARGS]( args, );
	}
	
	static [ARRANGE_ARGS]( args, table={ children:[], listeners:[], attributes:{}, }, )
	{
		for( let arg of args )
			// Array: arrange each
			if( Array.isArray( arg, ) )
				this[ARRANGE_ARGS]( arg, table, );
			else
			// ITemplate: as a child
			if( arg instanceof ITemplate )
				table.children.push( arg, );
			else
			// Listener: listen
			if( arg && arg.constructor === Listener )
				table.listeners.push( arg, );
			else
			// Plant Object: as attributes
			if( arg && arg.constructor === Object )
				Object.assign( table.attributes, arg, );
			else
			// String: make a TextNode as a child
			if( typeof arg === 'string' || (arg && arg.constructor === String) )
				table.children.push( new TextNode( arg, ), );
			else
			// Model: treat as a String
			if( arg instanceof Model )
				table.children.push( new TextNode( arg, ), );
			else
			// other: convert to a String
			if( arg || !isNaN( arg, ) )
				table.children.push( new TextNode( `${arg}`, ), );
		
		return table;
	}
	
	static diff( x, y, )
	{
		
	}
}

export const create= VDOM.create;
export const createNS= VDOM.createNS;
export const forEach= VDOM.forEach;
export const arrangeArgs= VDOM.arrangeArgs;
export const diff= VDOM.diff;
