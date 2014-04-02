/**
 * @alias frmValidate Implement Mask
 * @author Felipe Pupo Rodrigues
 * @classDescription implementação de eventos de mascara
 */
mooValidation.implement({
	options:{
		checkRulesInBlur: true,
		activeMask: true,
		mask:{},
		charMap:{
			'9':"[0-9]",
			'a':"[A-Za-z]",
			'*':"[A-Za-z0-9]"
		}
	},
	initialize: function(options){
		this.parent(options);
			
		for (elementName in this.options.rules)
		{
			var formElements = this.getFormElement(elementName);
							
			$$(formElements).each(function(el){
				var type = el.getProperty('type');
				
				if(type != 'radio' && type != 'checkbox'){
					if(this.options.checkRulesInBlur){
						el.addEvent('blur', this.checkRuleBlur.bind(this,elementName));
					}
					if(this.options.activeMask){
						el.addEvents({
							'keyup': this.maskUp.bindWithEvent(this,elementName),
							'keydown': this.maskDown.bindWithEvent(this,elementName)
						});
					}
				}else if(this.options.checkRulesInBlur){
					el.addEvent('click', this.checkRuleBlur.bind(this,elementName));
				}
				
			},this);
		}
	
	},
	checkRuleBlur: function(elementName){
		this.checkRules(elementName);
		this.updateError(elementName);
	},
	maskUp:function(e,elementName){
		if(this.options.mask[elementName]){
			e = new Event(e);
		}
	},
	maskDown:function(e,elementName){
		if(this.options.mask[elementName]){
			e = new Event(e);
			var ctl = this.getCaretPosition(e);
			for(var x = ctl.end; x >= ctl.begin ; x--){
				console.info(x);
			}
		}
	},
	getCaretPosition: function(ctl){
		ctl = ctl.target;
		var res = {begin: 0, end: 0 };
		if (ctl.setSelectionRange){
			res.begin = ctl.selectionStart;
			res.end = ctl.selectionEnd;
		}else if (document.selection && document.selection.createRange){
			var range = document.selection.createRange();			
			res.begin = 0 - range.duplicate().moveStart('character', -100000);
			res.end = res.begin + range.text.length;
		}
		return res;
	},
	setCaretPosition: function(ctl, pos){
		ctl = ctl.target;
		if(ctl.setSelectionRange){
			ctl.focus();
			ctl.setSelectionRange(pos,pos);
		}else if (ctl.createTextRange){
			var range = ctl.createTextRange();
			range.collapse(true);
			range.moveEnd('character', pos);
			range.moveStart('character', pos);
			range.select();
		}
	}
})