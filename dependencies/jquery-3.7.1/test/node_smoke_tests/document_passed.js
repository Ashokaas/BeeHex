"use strict";

const { JSDOM } = require( "jsdom" );

const { ensureJQuery } = require( "./lib/ensure_jquery" );
const { ensureGlobalNotCreated } = require( "./lib/ensure_global_not_created" );
const { getJQueryModuleSpecifier } = require( "./lib/jquery-module-specifier" );

const { window } = new JSDOM( "" );

const jQueryModuleSpecifier = getJQueryModuleSpecifier();
const jQueryFactory = require( jQueryModuleSpecifier );
const jQuery = jQueryFactory( window );

ensureJQuery( jQuery );
ensureGlobalNotCreated( module.exports );
