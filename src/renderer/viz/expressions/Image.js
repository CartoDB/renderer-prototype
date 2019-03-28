import Base from './base';
import { checkString, checkMaxArguments, noOverrideColor } from './utils';

/**
 * Image. Load an image and use it as a symbol.
 *
 * Note: image RGB color will be overridden if the viz `color` property is set.
 *
 * @param {String} url - Image path
 *
 * @example <caption>Load a svg image.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   symbol: s.image('./marker.svg')
 * });
 *
 * @example <caption>Load a svg image. (String)</caption>
 * const viz = new carto.Viz(`
 *    symbol: image('./marker.svg')
 * `);
 * @memberof carto.expressions
 * @name image
 * @function
 * @api
*/

export default class Image extends Base {
    constructor (url) {
        checkMaxArguments(arguments, 1, 'image');
        checkString('image', 'url', 0, url);

        super({});
        this.type = 'image';
        this.canvas = null;
        this.url = url;
        this.isLoaded = false;
        this._promise = new Promise((resolve, reject) => {
            this.image = new window.Image();
            this.image.onload = () => {
                this.isLoaded = true;
                resolve();
            };
            this.image.onerror = reject;
            this.image.crossOrigin = 'anonymous';
            this.image.src = this.url;
        });
    }

    loadImages () {
        this.count = this.count + 1 || 1;
        return this._promise;
    }

    keepDefaultsOnBlend () {
        // Keep default image color if setting a symbol after viz initialization with defaults
        if (this.default && this.parent.color.default) {
            this.parent.color = noOverrideColor();
        }
    }

    eval () {
        return this.url;
    }

    _free (gl) {
        if (this.texture) {
            gl.deleteTexture(this.texture);
        }
    }

    _applyToShaderSource () {
        return {
            preface: this._prefaceCode(`uniform sampler2D texSprite${this._uid};`),
            inline: `texture2D(texSprite${this._uid}, imageUV).rgba`
        };
    }

    _postShaderCompile (program, gl) {
        this._getBinding(program)._texLoc = gl.getUniformLocation(program, `texSprite${this._uid}`);
    }

    _preDraw (program, drawMetadata, gl) {
        if (!this.texture) {
            this.texture = gl.createTexture();
        }

        gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
        gl.uniform1i(this._getBinding(program)._texLoc, drawMetadata.freeTexUnit);
        drawMetadata.freeTexUnit++;

        if (this.isLoaded) {
            const imageSize = 256;

            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);

            this.image.width = this.image.width || imageSize;
            this.image.height = this.image.height || imageSize;
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
        }
    }
}
