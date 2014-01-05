/**
 * Created by saito on 2013/12/28.
 */
var shimohi;
if(!shimohi)
	shimohi  = {};
if(!shimohi.transform)
	shimohi.transform = {};

(function(){

	//小数点を丸める桁数
	var ROUND_DIGITS = 5;

	var ROUND_NUMBER = Math.pow(10,ROUND_DIGITS);

	/**
	 * 座標オブジェクト　ピクセル指定
	 * @param x
	 * @param y
	 * @constructor
	 */
	function Point(x,y){
		this.x = x;
		this.y = y;
	}

	/**
	 * Matrixオブジェクトのコンストラクタ
	 * @param a
	 * @param b
	 * @param c
	 * @param d
	 * @param tx
	 * @param ty
	 * @constructor
	 */
	function Matrix(a,b,c,d,tx,ty){
		this.a = checkAndConvertNumber(a,1);
		this.b = checkAndConvertNumber(b,0);
		this.c = checkAndConvertNumber(c,0);
		this.d = checkAndConvertNumber(d,1);
		this.tx = checkAndConvertNumber(tx,0);
		this.ty = checkAndConvertNumber(ty,0);
	}

	/**
	 * @param tx
	 * @param ty
	 */
	Matrix.prototype = {

		/**
		 * このマトリックスのクローンを生成します。
		 * @returns {Matrix}
		 */
		clone:function(){
			return new Matrix(this.a,this.b,this.c,this.d,this.tx,this.ty);
		},

		/**
		 * このマトリックスの逆変換を実行します。
		 */
		invert:function(){

			var a1 = this.a;
			var b1 = this.b;
			var c1 = this.c;
			var d1 = this.d;
			var tx1 = this.tx;
			var ty1 = this.ty;

			//このマトリックスとの行列積が初期値
			//|1 0 0
			//|0 1 0
			//|0 0 1
			//となるような値を求める
			this.a = round(-a1 / (b1 * c1 - a1 * d1));
			this.b = round(b1 / (b1 * c1 - a1 * d1));
			this.c = round(-c1 / (a1 * d1 - b1 * c1));
			this.d = round(a1 / (a1 * d1 - b1 * c1));

//			this.tx = round((a1 * ty1 - tx1) / (a1 * d1 - b1 * c1));
//			this.ty = round(-(c1 * (a1 * ty1 - tx1))/(a1 * (a1 * d1 - b1 * c1)) - tx1 / a1);
			this.tx = round(-tx1);
			this.ty = round(-ty1);
			return this;
		},

		/**
		 * 変換マトリックスに並行移動を加えます。
		 * @param tx
		 * @param ty
		 * @returns {Matrix}
		 */
		translate:function(tx,ty){
			var translateMatrix = new Matrix(1,0,0,1,tx,ty);
			return this.concatMatrix(translateMatrix);
		},

		/**
		 * 変換マトリックスにX軸方向への変倍を加えます。
		 * @param scaleX
		 * @returns {Matrix}
		 */
		scaleX:function(scaleX){
			return this.scale(scaleX,1);
		},

		/**
		 * 変換マトリックスにY軸方向への変倍を加えます。
		 * @param scaleY
		 * @returns {Matrix}
		 */
		scaleY:function(scaleY){
			return this.scale(1,scaleY);
		},

		/**
		 * 変換マトリックスに変倍を加えます。
		 * @param scaleX
		 * @param scaleY
		 * @returns {Matrix}
		 */
		scale:function(scaleX,scaleY){
			var scaleMatrix = new Matrix(scaleX,0,0,scaleY,0,0);
			return this.concatMatrix(scaleMatrix);
		},

		/**
		 * 変換マトリックスに回転成分を加えます。
		 * @param rad
		 * @returns {Matrix}
		 */
		rotate:function(rad){
			var cos = Math.cos(rad);
			var sin = Math.sin(rad);
			var rotateMatrix = new Matrix(cos,sin,-sin,cos,0,0);
			return this.concatMatrix(rotateMatrix);
		},

		/**
		 * マトリックスにX軸方向へのゆがみ成分を加えます。
		 * @param radX
		 * @returns {Matrix}
		 */
		skewX:function(radX){
			return this.skew(radX,0);
		},

		/**
		 * マトリックスにY軸方向へのゆがみ成分を加えます。
		 * @param radY
		 * @returns {Matrix}
		 */
		skewY:function(radY){
			return this.skew(0,radY);
		},

		/**
		 * マトリックスにゆがみ成分を加えます。
		 * @param radX
		 * @param radY
		 * @returns {Matrix}
		 */
		skew:function(radX,radY){
			var tanX = checkAndConvertNumber(Math.tan(round(radX)),Number.MAX_VALUE);
			var tanY = checkAndConvertNumber(Math.tan(round(radY)),Number.MAX_VALUE);

			var skewMatrix = new Matrix(1,tanY,tanX,1,0,0);
			return this.concatMatrix(skewMatrix);
		},

		/**
		 * Matrixを結合します。
		 * @param matrix
		 * @returns {Matrix}
		 */
		concatMatrix:function(matrix){

			var a1 = this.a;
			var b1 = this.b;
			var c1 = this.c;
			var d1 = this.d;
			var tx1 = this.tx;
			var ty1 = this.ty;

			//行列の積を求める
			// | a c tx |
			// | b d ty |
			// | 0 0 1  |
			this.a = round(a1 * matrix.a + c1 * matrix.b);// + tx1 * 0;
			this.b = round(b1 * matrix.a + d1 * matrix.b);// + ty1 * 0;
			this.c = round(a1 * matrix.c + c1 * matrix.d);// + tx1 * 0;
			this.d = round(b1 * matrix.c + d1 * matrix.d);// + ty1 * 0;
//			this.tx = round(a1 * matrix.tx + c1 * matrix.ty + tx1);// * 1;
//			this.ty = round(b1 * matrix.tx + d1 * matrix.ty + ty1);// * 1;
			this.tx = round(matrix.tx  + tx1);
			this.ty = round(matrix.ty + ty1);
			return this;
		},

		/**
		 * マトリックスに合わせて、座標変換を行います。
		 * @param point
		 * @returns {Point}
		 */
		transformPoint:function(point){
			var x = this.a * point.x + this.c * point.y + this.tx;
			var y = this.b * point.x + this.d * point.y + this.ty;
			return new Point(x,y);
		}
	};

	function round(number){
		var number1 = number * ROUND_NUMBER;
		number1 = Math.round(number1);
		return number1/ROUND_NUMBER;
	}

	/**
	 * 指定された値を数値化して返します。
	 * @param number
	 * @param substitute
	 * @returns {*}
	 */
	function checkAndConvertNumber(number,substitute){
		if(number == null || number.length==0 || !isFinite(number)){
			return substitute;
		}
		return Number(number);
	}

	var ns = shimohi.transform;
	ns.Matrix = Matrix;

})();

//JQueyプラグインの実装
$(function() {

	/**
	 * JQueryオブジェクトに対する変形用マトリックス。
	 */
	function TransformMatrix(JQuery,includeMatrix){

		var jqueryElement = JQuery;
		var matrix = (includeMatrix == null) ? new shimohi.transform.Matrix(1,0,0,1,0,0):includeMatrix;

		/**
		 * Matrixで指定された変形情報を要素に反映させます。
		 * @returns {TransformMatrix}
		 */
		function doTransform(){

			//CSSの設定
			var matrixStr = 'matrix(';
			matrixStr += matrix.a + ',';
			matrixStr += matrix.b + ',';
			matrixStr += matrix.c + ',';
			matrixStr += matrix.d + ',';
			matrixStr += matrix.tx + ',';
			matrixStr += matrix.ty + ')';
			jqueryElement.css('-moz-transform',matrixStr);
			jqueryElement.css('-webkit-transform',matrixStr);
			jqueryElement.css('-ie-transform',matrixStr);
			jqueryElement.css('transform',matrixStr);
			return TransformMatrix(jqueryElement,matrix);
		}

		return {

			/**
			 * マトリックスのクローンを取得します。
			 * @returns {shimohi.transform.Matrix}
			 */
			getMatrixClone:function(){
				return matrix.clone();
			},
			/**
			 * このマトリックスの逆変換を行います。
			 * @returns {TransformMatrix}
			 */
			invert:function(){
				matrix.invert();
				return doTransform();
			},
			/**
			 * 要素の並行移動を行います。
			 * @param tx
			 * @param ty
			 * @returns {TransformMatrix}
			 */
			translate:function(tx,ty){
				matrix.translate(tx,ty);
				return doTransform();
			},
			/**
			 * 要素をX軸方向に拡大・縮小します。
			 * @param scaleX
			 * @returns {TransformMatrix}
			 */
			scaleX:function(scaleX){
				matrix.scaleX(scaleX);
				return doTransform();
			},
			/**
			 * 要素をY軸方向に拡大・縮小します。
			 * @param scaleY
			 * @returns {TransformMatrix}
			 */
			scaleY:function(scaleY){
				matrix.scaleY(scaleY);
				return doTransform();
			},
			/**
			 * 要素を拡大・縮小します。
			 * @param scaleX
			 * @param scaleY
			 * @returns {TransformMatrix}
			 */
			scale:function(scaleX,scaleY){
				matrix.scale(scaleX,scaleY);
				return doTransform();
			},
			/**
			 * 要素を回転します。
			 * @param rad
			 * @returns {TransformMatrix}
			 */
			rotate:function(rad){
				matrix.rotate(rad);
				return doTransform();
			},
			/**
			 * 要素をX軸方向に歪ませます。
			 * @param radX
			 * @returns {TransformMatrix}
			 */
			skewX:function(radX){
				matrix.skewX(radX);
				return doTransform();
			},
			/**
			 * 要素をY軸方向に歪ませます。
			 * @param radY
			 * @returns {TransformMatrix}
			 */
			skewY:function(radY){
				matrix.skewY(radY);
				return doTransform();
			},
			/**
			 * 要素を歪ませます。
			 * @param radX
			 * @param radY
			 * @returns {TransformMatrix}
			 */
			skew:function(radX,radY){
				matrix.skew(radX,radY);
				return doTransform();
			},
			/**
			 * マトリックスを加算します。
			 * @param matrix1
			 * @returns {TransformMatrix}
			 */
			concatMatrix:function(matrix1){
				matrix.concatMatrix(matrix1);
				return doTransform();
			}
		};
	}

	/**
	 * JQueryを拡張
	 */
	$.fn.extend({
		createMatrix: function(){
			var result = [];
			this.each(function(){
				result.push(this);
			});
			return TransformMatrix($(result));
		}
	});
});
