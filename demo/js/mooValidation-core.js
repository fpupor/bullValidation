/**
 * @alias frmValidate
 * @author Felipe Pupo Rodrigues
 * @classDescription verifica se os campos de um formulario
 * ou elementos de um container estao de acordo com as regras definidas
 */
mooValidation = new Class({
	Implements: Options, //implementa metodos na classe
	status: {}, //guarda status de cada elemento
	options:{
		/*
		 * Configuracoes basicas
		 */
		form:null, //objeto ou id do formulario
		container:null, //container dos campos. só funciona quando o form nao é declarado
		rules:{}, //nome ou classe dos elementos do formulario
		errors:{}, //nome ou classe dos elementos do formulario, os erros sao separado para cada regra aplicada
		
		/*
		 * Configuracoes do Display de Erros
		 */
		showErrors: true, //mostra os erros e controla automaticamente o seu container
		errorsContainer: null, //container onde aparece as mensagens
		errorsContainerClass: "fv-error-container", //classe dada ao container quando existe erro
		errorsContainerElement: "p", //elemento criado para cada mensagem
		errorsContainerElementClass: false, //classe aplicada no elemento da mensagem
		errorsElementClass: "fv-error-element", //classe aplicada no elemento do formulario
		errorsLabelAutoSearch: true, //busca automaticamente os labels de cada elemento, sendo necessario uma estrutura bem dividida. caso contrario usar tag for indicando o name do elemento
		errorsLabelElement: "label", //nome do elemento label que esta sendo utilizado
		errorsLabelClass: "fv-error-label", //classe aplicada no label do elemento
		errorsLegendElement: "legend", //nome do elemento legend que esta sendo utilizado
		errorsLegendClass: "fv-error-legend", //classe aplicada no legend do elemento
		errorsFieldsetElement: "fieldset", //nome do elemento fieldset que esta sendo utilizado
		errorsFieldsetClass: "fv-error-fieldset", //classe aplicada no fieldset do elemento
		
		/*
		 * Configuracoes de eventos (avancado)
		 */
		updateIntercept: $lambda(true), //funcao chamada para controle externo dos erros geral
		errorsIntercept: $lambda(true), //funcao chamada para controle externo dos erros
		submitIntercept: function(state){return state;}, //funcao chamada quando tudo estiver ok e o formulario esta pronto para ser enviado
		success: $lambda(null), //funcao chamada para controle externo quando o validador passar pelas regras
		failed: $lambda(null), //funcao chamada para controle externo quando o validador nao passar pelas regras
		
		/*
		 * container de regras para ser usadas
		 */
		validators:{}
	},
	
	/**
	 * inicia a base para o formulario, chama as funcoes necessarias para monitorar os campos
	 * @param {Object} options
	 */
	initialize: function(options){
		this.setOptions(options);
		this.options.form = $(this.options.form);
		this.options.container = $(this.options.container);

		this.options.form.addEvent('submit',this.validateRules.bind(this));

		this.options.form.getElements('input[type=reset]').addEvent('click',function(){
			this.options.form.reset();
			this.validateRules();
		}.bind(this));
	},
	
	/**
	 * verifica se todas as regras dcampos sao validos
	 */
	validateRules: function(){
		this.valid = true;
		
		for (elementName in this.options.rules)
		{
			this.valid = this.checkRules(elementName);
		}
		
		this.updateErrors();
		
		if(this.valid)
		{
			this.options.success.call(this);
			return this.options.submitIntercept(true);
		}

		this.options.failed.call(this)
		return this.options.submitIntercept(false);

	},
	
	/**
	 * verifica se as regras de um campo sao validas
	 * @param {String} elementName
	 */
	checkRules: function(elementName){
		if(!this.status[elementName])
		{
			this.status[elementName] = {};
		}
		
		var validateRule = this.options.rules[elementName];
		
		var elements = this.getFormElement(elementName);
		var values = this.getFormElementValue(elements);
		var valid = this.valid;
		
		for(var name in validateRule){
			var result = this.options.validators[name].call(this, values, elements, validateRule[name]);
			if(result == null)
			{
				this.removeError(elementName,name);
				break;
			}
			else if(result)
			{
				this.removeError(elementName,name);
				valid = valid && true;
			}
			else
			{
				this.addError(elementName,name);
				valid = false;
				break;
			}
		}
		return valid;
	},
	
	/**
	 * retorna o elemento que esta dentro do formulario (ou container)
	 * @param {String} name
	 */
	getFormElement: function(name){
		var container = this.getContainer();

		if(container && container[name])
		{
			var list = container[name]
		}
		else
		{
			var list = container.getElements('.' + name);
		}
		
		var type = $type(list);
		if(type == 'array' || type == 'collection')
		{
			return list;
		}

		return [list];
		
		/*var e = name;
		var container = (this.options.form)?this.options.form:((this.options.container)?this.options.container:document);
		var list = (this.options.form && container[e])?container[e]:container.getElements('.'+e);
		var type = $type(list);
		return (type == 'array' || type == 'collection')?list:[list];
		*/
	},
	
	/**
	 * retorna o valor de um grupo de elementos
	 * @param {Object} elements
	 */
	getFormElementValue: function(elements){
		var values = [];
		var test = false;

		for(var c = 0; c < elements.length; c++){
			var element = elements[c];
			var value = this.getFieldValue(element);
			
			if(!test && value != null)
			{
				test = true;
			}
			
			values.push(value);
		}
		
		if(test)
		{
			return values;
		}
		return null;
	},
	
	getFieldValue: function(el){
		var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
		
	    if  (!n || el.disabled || t == 'reset' || t == 'button' || (t == 'checkbox' || t == 'radio') && !el.checked || (t == 'submit' || t == 'image') && el.form && el.form.clk != el ||
        tag == 'select' && el.selectedIndex == -1)
            return null;
		
		if(tag == 'select')
			return Element.getSelected(el).map(function(opt){
				return (opt.value == '')?null:opt.value;
			})[0];
		
		return (el.value != '')?el.value:null;	
	},
	
	getContainer: function(){
		if(this.options.form)
		{
			return this.options.form;
		}
		else if(this.options.container)
		{
			return this.options.container;
		}
		else
		{
			return document;
		}	
	},
	
	getElementLabelAndLegend: function(el,groupname){	
		labels = [];
		legends = [];
		fieldsets = [];
		
		var container = this.getContainer();
		
		for(var x = 0; x< el.length;x++)
		{
			//fieldset
			var fieldset = el[x].getParents(this.options.errorsFieldsetElement);
			
			if(this.options.errorsLabelAutoSearch){
				//label
				var label = el[x].getParents(this.options.errorsLabelElement);
				label = (label && label[0])?label:el[x].getAllNext(this.options.errorsLabelElement);
				label = (label && label[0])?label:el[x].getAllPrevious(this.options.errorsLabelElement);
				
				label = (label && label[0])?label[0]:null;
				
				//legend
				var legend = el[x].getChildren(this.options.errorsLegendElement);
				legend = (legend &&  legend[0])?legend:el[x].getParents(this.options.errorsLegendElement);
				legend = (legend &&  legend[0])?legend:(fieldset)?fieldset.getChildren(this.options.errorsLegendElement):false;
				legend = (legend && legend[0])?legend:el[x].getAllNext(this.options.errorsLegendElement);
				legend = (legend && legend[0])?legend:el[x].getAllPrevious(this.options.errorsLegendElement);
				
				legend = (legend && legend[0])?legend[0]:null;
			}else{
				var seletor = el[x].getProperty('id');
				seletor = (seletor)?seletor:el[x].getProperty('name');
				
				var label = container.getElements(this.options.errorsLabelElement+"[for="+seletor+"]");
				label = (label && label[0])?label:container.getElements(this.options.errorsLabelElement+"[for="+groupname+"]");
				label = (label && label[0])?label:container.getElements(this.options.errorsLabelElement+"[class="+seletor+"]");
				label = (label && label[0])?label:container.getElements(this.options.errorsLabelElement+"[class="+groupname+"]");
				label = (label && label[0])?label:null;
				
				var legend = container.getElements(this.options.errorsLegendElement+"[for="+seletor+"]");
				legend = (legend && legend[0])?legend:container.getElements(this.options.errorsLegendElement+"[for="+groupname+"]");
				legend = (legend && legend[0])?legend:container.getElements(this.options.errorsLegendElement+"[class="+seletor+"]");
				legend = (legend && legend[0])?legend:container.getElements(this.options.errorsLegendElement+"[class="+groupname+"]");
				legend = (legend && legend[0])?legend:null;
			}
			if(label){
				labels.push(label);
			}
			if(legend){
				legends.push(legend);
			}
			if(fieldset){
				fieldsets.push(fieldset);
			}
		}
		
		return {labels:labels,legends:legends,fieldsets:fieldsets};
	},
	
	
	applyRule: function(values,fn,cn){	
		var result = [];	
		var check = true;
		
		if(values != null)
		{
			for(var c = 0; c < values.length; c++)
			{
				value = fn.call(this,values[c],c);
				result[c] = value;
				check = check && value;
			}
		}
		else
			check = null;
		
		if(cn)
			check = cn.call(this,check,result);
			
		return check;
	},
	
	getStatusRule:function(v){
		var check = (v != null)?true:false;
		var success = 0;
		var errors = 0;
		if(check)
		for(var c =0; c<v.length; c++)
		{
			if(v[c] != null)
			{
				check = check && true;
				success ++; 	
			}
			else
			{
				check = check && false;
				errors ++;
			}	
		}
		return {
			check:check,
			success:success,
			errors:errors
		};
	},
	
	/**
	 * atualiza o status do erro
	 * @param {Object} elementName
	 * @param {Object} type
	 */
	addError: function(elementName,type){
		var element = this.getFormElement(elementName);
		this.status[elementName] = $extend(this.status[elementName],{
			elementName: elementName,
			element: element,
			elementLabel: this.getElementLabelAndLegend(element,elementName),
			message: this.options.errors[elementName][type],
			type: type,
			clean: false
		});
	},
	
	/**
	 * atualiza o status do erro
	 * @param {Object} elementName
	 * @param {Object} type
	 */
	removeError: function(elementName,type){
		var element = this.getFormElement(elementName);
		this.status[elementName] = $extend(this.status[elementName],{
			elementName: elementName,
			element: element,
			elementLabel: this.getElementLabelAndLegend(element,elementName),
			type: type,
			clean: true
		});
	},
	
	/**
	 * atualiza os erros
	 * responsavel tambem por chamar updateIntercept
	 */
	updateErrors: function(){
		for(var error in this.status){
			this.updateError(error);
		}
		this.options.updateIntercept.call(this, this.status);
	},
	
	/**
	 * atualiza um erro criando seu elemento
	 * responsavel tambem por chamar errorsIntercept
	 */
	updateError: function(elementName){
		var rule = this.status[elementName];
			
		if (this.options.showErrors) 
		{
			if (!rule.messageElement) {
				rule = this.createMessageElement(rule);
			}
			
			if (!rule.clean) {
				rule.messageElement.set('text', rule.message);
				rule.messageElement.setStyle('display', 'block');
				$$(rule.element).addClass(this.options.errorsElementClass);
				$$(rule.elementLabel.labels).addClass(this.options.errorsLabelClass);
				$$(rule.elementLabel.legends).addClass(this.options.errorsLegendClass);
				$$(rule.elementLabel.fieldsets).addClass(this.options.errorsFieldsetClass);
			}
			else {
				rule.messageElement.setStyle('display', 'none');
				$$(rule.element).removeClass(this.options.errorsElementClass);
				$$(rule.elementLabel.labels).removeClass(this.options.errorsLabelClass);
				$$(rule.elementLabel.legends).removeClass(this.options.errorsLegendClass);
				$$(rule.elementLabel.fieldsets).removeClass(this.options.errorsFieldsetClass);
			}
		}
		
		this.options.errorsIntercept.call(this, rule, rule.clean);
	},
	
	/**
	 * cria elemento para mensagem de erro
	 * usando container ou beside que cria o erro ao lado do elemento
	 */
	createMessageElement: function(rule){	
		rule.messageElement = new Element(this.options.errorsContainerElement);
		if(this.options.errorsContainerElementClass)
		{
			rule.messageElement.addClass(this.options.errorsContainerElementClass);
		}

		if(rule.element && !this.options.errorsContainer){
			var el = rule.element[rule.element.length-1];
			el = (!el && rule.element[0])?rule.element[0]:el;
			
			var pa = el.getParent();
			
			if(pa === el.getParent(this.options.errorsFieldsetElement))
				rule.messageElement.inject(pa,"bottom");
			else if(el)
				rule.messageElement.inject(el,"after");
		}
		else
		{
			rule.messageElement.inject($(this.options.errorsContainer));
		}
		return rule;
	}
});