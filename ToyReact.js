

class ElementWrapper {
    constructor(type){
        this.root = document.createElement(type);
    }
    setAttribute(name, value){
        this.root.setAttribute(name, value);
    }
    appendChild(vchild){
        vchild.mounTo(this.root);
    }
    mounTo(parent){
        parent.appendChild(this.root);
    }
}

class TextWrapper {
    constructor(content){
        this.root = document.createTextNode(content);
    }
    mounTo(parent){
        parent.appendChild(this.root);
    }
}

export class Component {
    constructor(){
        this.children = [];
    }
    setAttribute(name, value){
        this[name] = value;
    }
    mounTo(parent){
        let vdom = this.render();
        console.log(vdom,123)
        vdom.mounTo(parent);
    }
    appendChild(vchild){
        this.children.push(vchild);
    }
}

export let ToyReact = {
    /**
     * 编译jsx语法阶段调用的方法
     * @param {*} type 
     * @param {*} attributes 
     * @param  {...any} children 
     */
    createElement(type, attributes, ...children){
        //console.log(type, attributes, ...children, 666);
        let element;
        /**
         * type等于string代表是普通标签
         * 否则就是自定义组件类，那么就new 组件类实例
         */
        if(typeof type === "string"){
            element = new ElementWrapper(type);
        }else{
            element = new type;
        }
        /**
         * 设置标签属性
         */
        for(let name in attributes){
            element.setAttribute(name,attributes[name]);
        }
        /**
         * 递归标签内的子集元素方法
         * @param {} children 
         */
        let insertChildren = (children) => {            
            for(let child of children){
                if(typeof child === "object" && child instanceof Array){
                    insertChildren(child);
                }else{      
                    /**
                     * 判断child是否为 Component，ElementWrapper，TextWrapper 这些类的实例，都不是那就当字符串处理
                     * 一般都不是的都标签内的文本
                     */
                    if(
                        !(child instanceof Component)
                        && !(child instanceof ElementWrapper)
                        && !(child instanceof TextWrapper)
                    ){
                        child = String(child);
                    }
                    /**
                     * 类型为字符串就。。。
                     */
                    if(typeof child === "string"){
                        child = new TextWrapper(child);
                    }
                    
                    element.appendChild(child);
                }
            }
        }
        insertChildren(children);
        return element;
    },
    render(vdom, element){
        console.log(vdom)
        vdom.mounTo(element);        
    }

}