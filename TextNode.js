import Model, { ArrayModel, } from 'https://oxo.fenzland.com/OmO/0.1/Model.js';

const CONTENT= Symbol( 'CONTENT', );
const DOM= Symbol( 'DOM', );

export default class TextNode
{
	constructor( content )
	{
		if( content instanceof Model )
		{
			content.observedBy( content=> this.updateContent( content, ), );
			
			this.updateContent( content.valueOf(), );
		}
		else
		{
			this.updateContent( content, );
		}
	}
	
	toHTML()
	{
		const dom= document.createElement( 'span', );
		
		dom.innerText= this[CONTENT];
		
		return dom.innerHTML;
	}
	
	updateContent( content, )
	{
		this[CONTENT]= `${content}`;
		
		if( this[DOM] )
		{
			this[DOM].data= this.toString();
		}
	}
	
	toDOM( document, )
	{
		return [ this[DOM]= new Text( this.toString(), ), ];
	}
	
	toString()
	{
		return this[CONTENT];
	}
}

export class EscapeFreeTextNode extends TextNode
{
	constructor( content, )
	{
		super( content, );
	}
	
	toHTML()
	{
		return this[CONTENT];
	}
	
	toString()
	{
		const dom= document.createElement( 'span', );
		
		dom.innerHTML= this[CONTENT];
		
		return dom.innerText;
	}
}

export function escapeFree( content, )
{
	return new EscapeFreeTextNode( content, );
}
