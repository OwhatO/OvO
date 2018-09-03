import Model, { ArrayModel, } from 'https://oxo.fenzland.com/OmO/0.1/Model.js';
import VDOM from './VDOM.js';
import TextNode from './TextNode.js';

const MODEL= Symbol( 'MODEL', );
const VDOMS= Symbol( 'VDOMS', );
const DOMS= Symbol( 'DOMS', );
const ACTIVED_DOMS= Symbol( 'GET_DOMS', );
const GET_DOMS= Symbol( 'GET_DOMS', );
const UPDATE= Symbol( 'UPDATE', );
const TO_BOOL= Symbol( 'TO_BOOL', );
const TEMPLATE= Symbol( 'TEMPLATE', );
const MAKE_ROW= Symbol( 'MAKE_ROW', );
const INDEXES= Symbol( 'INDEXES', );
const INDEX_OF= Symbol( 'INDEXES_OF', );
const ARRANGE_INDEXES= Symbol( 'ARRANGE_INDEXES', );
const ARRANGING_INDEXES= Symbol( 'ARRANGING_INDEXES', );
const DOCUMENT= Symbol( 'DOCUMENT', );
const ROW_CACHE= Symbol( 'ROW_CACHE', );

export default class Ctrl
{
	constructor()
	{
		
	}
};

class IfCtrl extends Ctrl
{
	constructor( model, )
	{
		super();
		
		this[MODEL]= model;
		
		model.observedBy( ( v, o, )=> {
			if( this.constructor[TO_BOOL]( v, ) ^ this.constructor[TO_BOOL]( o, ) )
				this[UPDATE]( +this.constructor[TO_BOOL]( v, ), );
		}, );
		
		this[DOMS]= {};
		this[VDOMS]= {
			1: [ new TextNode( '', ), ],
			0: [ new TextNode( '', ), ],
		};
	}
	
	then( first, ...args )
	{
		if( first instanceof Function )
			this[VDOMS][1]= VDOM.create( '', first( this[MODEL], ), ).children;
		else
			this[VDOMS][1]= VDOM.create( '', first, ...args, ).children;
		
		return this;
	}
	
	else( ...args )
	{
		this[VDOMS][0]= VDOM.create( '', ...args, ).children;
		
		return this;
	}
	
	and( callback, ...otherModels )
	{
		return If( Model.express( callback, this[MODEL], ...otherModels, ), );
	}
	
	toHTML()
	{
		return this[VDOMS][this.value].map( x=> x.toHTML(), ).join( '', );
	}
	
	toDOM( document, )
	{
		return this[ACTIVED_DOMS]= this[GET_DOMS]( this.value, );
	}
	
	get value()
	{
		return +this.constructor[TO_BOOL]( this[MODEL].valueOf(), );
	}
	
	[GET_DOMS]( value, )
	{
		if( this[DOMS][value] )
			return this[DOMS][value];
		else
			return this[DOMS][value]= this[VDOMS][value].map( x=> x.toDOM( document, ), ).reduce( ( x, y, )=> x.concat( y, ), [], );
		
	}
	
	[UPDATE]( value, )
	{
		// not render yet
		if(!( this[ACTIVED_DOMS] )) return;
		
		const doms= this[GET_DOMS]( value, );
		const originDoms= this[ACTIVED_DOMS];
		
		if( originDoms === doms ) return;
		
		this[ACTIVED_DOMS][0].replaceWith( ...doms, )
		
		this[ACTIVED_DOMS].slice( 1, ).forEach( x=> x.remove(), );
		
		this[ACTIVED_DOMS]= doms;
	}
	
	static [TO_BOOL]( x, )
	{
		return !!x;
	}
}

export function If( model, )
{
	return new IfCtrl( model, );
}

class IfNotCtrl extends IfCtrl
{
	static [TO_BOOL]( x, )
	{
		return !x;
	}
}

export function IfNot( model, )
{
	return new IfNotCtrl( model );
}

class IfDefCtrl extends IfCtrl
{
	static [TO_BOOL]( x, )
	{
		return x!==undefined;
	}
}

export function IfDef( model, )
{
	return new IfDefCtrl( model );
}

class IfUndCtrl extends IfCtrl
{
	static [TO_BOOL]( x, )
	{
		return x===undefined;
	}
}

export function IfUnd( model, )
{
	return new IfUndCtrl( model );
}

class ForEachCtrl extends Ctrl
{
	constructor( model, template, )
	{
		super();
		
		if(!( model instanceof ArrayModel ))
			throw 'The model for ForEach must be an ArrayModel.';
		
		if(!( 'function' === typeof template ))
			throw 'The template for ForEach must be a Function.';
		
		this[MODEL]= model;
		this[INDEXES]= new WeakMap;
		
		model.observedBy( ( i, model, removed, )=> this[UPDATE]( i, model, removed, ), );
		
		this[TEMPLATE]= template;
		this[ROW_CACHE]= new WeakMap;
	}
	
	toHTML()
	{
		return this[MODEL].map(
			x=> this[MAKE_ROW]( x, ).map( x=> x.toHTML(), ).join( '', ),
		).join( '', );
	}
	
	toDOM( document, )
	{
		this[DOCUMENT]= document;
		this[ACTIVED_DOMS]= this[MODEL].map(
			x=> {
				const doms= this[MAKE_ROW]( x, ).map( x=> x.toDOM( document, ), ).reduce( ( x, y, )=> x.concat( y, ), [], );
				
				if(!( doms.length ))
					doms.push( new Text( '', ), );
				
				return doms;
			},
		).concat( [ [ new Text( '', ), ], ], );
		
		this[ARRANGE_INDEXES]();
		
		return this[ACTIVED_DOMS].reduce( ( x, y, )=> x.concat( y, ), [], );
	}
	
	[MAKE_ROW]( x, )
	{
		let row= this[ROW_CACHE].get( x, );
		
		if(!( row ))
		{
			row= VDOM.create( '', this[TEMPLATE]( x, this[INDEX_OF]( x, ), ), ).children;
			
			this[ROW_CACHE].set( x, row, );
		}
		
		return row;
	}
	
	[INDEX_OF]( x, defaults=0, )
	{
		let i= this[INDEXES].get( x, );
		
		if(!( i ))
			this[INDEXES].set( x, i= new Model( defaults, 'ForEach.index', ), );
		
		return i;
	}
	
	[ARRANGE_INDEXES]()
	{
		if(!( this[ARRANGING_INDEXES] ))
			this[ARRANGING_INDEXES]= setTimeout( ()=>{
				for( let [ i, x, ] of this[MODEL].entries() )
					this[INDEX_OF]( x, ).setValue( i, );
				this[ARRANGING_INDEXES]= undefined;
			} );
	}
	
	[UPDATE]( i, model, removed, )
	{
		if(!( this[ACTIVED_DOMS] )) return;
		
		if( model )
		{
			const vdoms= this[MAKE_ROW]( model, );
			const doms= vdoms.map( x=> x.toDOM( this[DOCUMENT], ), ).reduce( ( x, y, )=> x.concat( y, ), [], )
			
			this[ACTIVED_DOMS][i][0].before( ...doms, );
			
			this[ACTIVED_DOMS].splice( i, 0, doms, );
		}
		else
		if(!( this[MODEL].currentlyIncludes( removed, ) ))
			this[ACTIVED_DOMS].splice( i, 1, )[0].forEach( x=> x.remove(), );
		
		this[ARRANGE_INDEXES]();
	}
}

export function ForEach( model, template, )
{
	return new ForEachCtrl( model, template, );
}
