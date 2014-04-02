/**
 * @alias frmValidate Implement Rules
 * @author Felipe Pupo Rodrigues
 * @classDescription implementação de regras para classe de validação
 * BOA PARTE DESTAS REGRAS FORAM RETIRADAS E ADAPTADAS DO JQUERY VALIDATION E OUTROS ENCONTRADOS NA INTERNET
 */
mooValidation.implement({
	options:{
		validators : {
			/**
			 * true = verifica se o campo(text, checkbox, etc) esta preenchido
			 * false = o campo nao precisa ser preenchido
			 * string = nome ou classe de outros elementos, para continuar eles devem estar preenchidos e corretos
			 */
			require : function(v,e,p){
				if(typeof p == 'string' && ((this.status[p])?!this.status[p].clean:this.checkRules(p)))
					return null;
				return (v != null)?true:((p)?false:null);
			},
			
			/**
			 * verifica se um ou outro campo esta preenchido (apenas preenchidos e requeridos)
			 */
			requireBetween : function(v,e,p,i){
				var compare = this.getFormElement(p);
				var compare_value = this.getFormElementValue(compare);
				
				if(this.options.rules[p].require_or !== undefined)
				{
					var test = this.options.validators.require_or.call(this,compare_value,compare,this.options.rules[p].require_or,true);
				}
				else if(this.options.rules[p].require !== undefined)
				{
					var test = this.options.validators.require.call(this,compare_value,compare,this.options.rules[p].require);
				}
				
				return (this.options.validators.require.call(this,v,e,true))?true:((i)?test:((test)?null:false));
			},
			
			/**
			 * verifica o maximo de caracteres de um campo
			 */
			maxLength : function(v,e,p){
				return (v[0].length <= p);
			},
			
			/**
			 * verifica o minimo de caracteres de um campo
			 */
			minLength : function(v,e,p){
				return (v[0].length >= p);
			},

			/**
			 * range de caracteres de um campo
			 */
			rangeLength : function(v,e,p){
				return ( v[0].length >= p[0] && v[0].length <= p[1] );
			},
			
			/**
			 * verifica os caracteres de um campo é numero
			 */
			number: function(v,e,p){
				return (/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(v[0]));
			},
			
			/**
			 * verifica se varios ou um campo é igual a outro
			 */
			equal: function(v,e,p){
				compare = this.getFormElementValue(this.getFormElement(p));
				return (v == null)?(v==compare):(function(){
					if(compare == null)
						return false;
					var check = true;
					for(var c = 0; c<v.length; c++)
					{
						check = check && (v[c] == compare[c]);
					}
					return check;
				})();
			},
			
			/**
			 * verifica se varios ou um campo é diferente de outro
			 */
			diff: function(v,e,p){
				//require validator of equal
				return !this.options.validators.equal(v,e,p);
			},
			
			/**
			 * verifica se e uma data valida
			 */	
			date: function(v){
				return !/Invalid|NaN/.test(new Date(v));
			},
			
			/**
			 * verifica uma data formatada
			 */	
			dateISO: function(v) {
				return /^\d{1,2}[\/-]\d{1,2}\d{4}[\/-]$/.test(v);
			},
			
			/**
			 * verifica se é digitos
			 */	
			digits: function(v) {
				return /^\d+$/.test(v);
			},
				
			/**
			 * espera retorno de uma funcao
			 * usado para ocasiões especiais que nao sao regras comuns
			 */		
			intercept: function(v,e,p){
				return p.apply(this,[v,e]);
			},
			
			/**
			 * verifica se é um email valido
			 */
			email: function(v,e) {
				// contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
				return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(v);
			},
			
			/**
			 * verifica se é uma url valida
			 */
			url: function(v,e) {
				// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
				return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(v);
			},
			
			/**
			 * verifica se é um cartão valido
			 */
			creditcard: function(v,e) {
				if (/[^0-9-]+/.test(v))
					return false;
				var nCheck = 0,
					nDigit = 0,
					bEven = false;
	
				v = v.replace(/\D/g, "");
	
				for (n = v.length - 1; n >= 0; n--) {
					var cDigit = v.charAt(n);
					var nDigit = parseInt(cDigit, 10);
					if (bEven) {
						if ((nDigit *= 2) > 9)
							nDigit -= 9;
					}
					nCheck += nDigit;
					bEven = !bEven;
				}
	
				return (nCheck % 10) == 0;
			},
			
			/**
			 * verifica se a extenção é aceita
			 */
			accept: function(v,e,p) {
				p = typeof p == "string" ? p.replace(/,/g, '|') : "png|jpe?g|gif";
				return v.match(new RegExp(".(" + p + ")$", "i"));
			}
			
		}
	}
})