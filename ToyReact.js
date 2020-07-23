//给type 一个wrapper来处理
let childrenSymbol = Symbol('chilren');

class ElementWrapper {
    constructor(type) {
        this.type = type;
        this.props = Object.create(null);
        this[childrenSymbol] = [];
        this.children = [];
    }
    setAttribute(name, value) {
        this.props[name] = value;
    }
    appendChild(vchild) {
        this[childrenSymbol].push(vchild);
        this.children.push(vchild.vdom);
    }
    get vdom() {
        return this;
    }
    mountTo(range) {
        this.range = range;
        let placeholder = document.createComment("placeholder");
        let endRange = document.createRange();
        endRange.setStart(range.endContainer, range.endOffset);
        endRange.setEnd(range.endContainer, range.endOffset);
        endRange.insertNode(placeholder);
        range.deleteContents();
        let element = document.createElement(this.type);
        for (let name in this.props) {
            let value = this.props[name];
            if (name.match(/^on([\s\S]+)$/)) {
                let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase());
                element.addEventListener(eventName, value);
            }
            if (name === "className") {
                element.setAttribute("class", value);
            }

            element.setAttribute(name, value);
        }

        for (let child of this.children) {
            let range = document.createRange();
            if (element.children.length) {
                range.setStartAfter(element.lastChild);
                range.setEndAfter(element.lastChild);
            } else {
                range.setStart(element, 0);
                range.setEnd(element, 0);
            }
            child.mountTo(range);
        }
        range.insertNode(element);
    }
}

class TextWrapper {
    constructor(content) {
      this.root = document.createTextNode(content);
      this.type = "#text";
      this.children = [];
      this.props = Object.create(null);
    }
    mountTo(range) {
      this.range = range;
      range.deleteContents();
      range.insertNode(this.root);
    }
    get vdom(){
      return this;
    }
}

export class Component {
    constructor() {
        this.children = [];
        this.props = Object.create(null);
    }
    get type() {
        return this.constructor.name;
    }
    setAttribute(name, value) {
        this.props[name] = value;
        this[name] = value;
    }
    mountTo(range) {
        this.range = range;
        this.update();
    }
    update() {
        let vdom = this.vdom;
        if (this.oldVdom) {
            let isSameNode = (node1, node2) => {
                if (node1.type !== node2.type) {
                    return false;
                }
                for (let name in node1.props) {
                    if (
                        typeof node1.props[name] === "object" &&
                        typeof node2.props[name] === "object" &&
                        JSON.stringify(node1.props[name]) === JSON.stringify(node2.props[name])
                    ) {
                        continue;
                    }
                    if (node1.props[name] !== node2.props[name]) {
                        return false;
                    }

                }
                if (Object.keys(node1.props).length !== Object.keys(node1.props).length) {
                    return false;
                }
                return true;
            }
            let isSameTree = (node1, node2) => {
                if (!isSameNode(node1, node2)) {
                    return false;
                }
                if (node1.children.length !== node2.children.length) {
                    return false;
                }
                for (let i = 0; i < node1.children.length; i++) {
                    if (!isSameTree(node1.children[i], node2.children[i])) {
                        return false;
                    }
                }
                return true;
            }
            let replace = (newTree, oldTree, indent) => {
                console.log('new:', vdom);
                console.log('old:', this.oldVdom);
                if (isSameTree(newTree, oldTree)) {
                    console.log('all some')
                    return;
                }
                if (!isSameNode(newTree, oldTree)) {
                    newTree.mountTo(oldTree.range);
                } else {
                    for (let i = 0; i < newTree.children.length; i++) {
                        replace(newTree.children[i], oldTree.children[i], " " + indent);
                    }
                }
            }

            replace(vdom, this.oldVdom, "");
        } else {
            vdom.mountTo(this.range);
        }
        this.oldVdom = vdom;
    }
    appendChild(vchild) {
        return this.children.push(vchild);
    }
    get vdom() {
        return this.render().vdom;
    }
    setState(state) {
        let merge = (oldState, newState) => {
            for (let p in newState) {
                if (typeof newState[p] === "object" && newState[p] !== null) {
                    if (typeof oldState[p] !== "object") {
                        if (newState[p] instanceof Array) {
                            oldState[p] = [];
                        } else {
                            oldState[p] = {};
                        }
                    }
                    merge(oldState[p], newState[p]);
                } else {
                    oldState[p] = newState[p];
                }
            }
        };
        if (!this.state && state) {
            this.state = {};
        }
        merge(this.state, state);
        this.update();
    }
}

let ToyReact = {
    /**
     * 编译jsx语法阶段调用的方法
     * @param {*} type
     * @param {*} attributes
     * @param  {...any} children
     */
    createElement(type, attributes, ...children) {
        //console.log(type, attributes, ...children, 666);
        let element;
        /**
         * type等于string代表是普通标签
         * 否则就是自定义组件类，那么就new 组件类实例
         */
        if (typeof type === "string") {
            element = new ElementWrapper(type);
        } else {
            element = new type();
        }
        /**
         * 设置标签属性
         */
        for (let name in attributes) {
            element.setAttribute(name, attributes[name]);
        }
        /**
         * 递归标签内的子集元素方法
         * @param {} children
         */
        let insertChildren = (children) => {
            for (let child of children) {
                if (typeof child === "object" && child instanceof Array) {
                    insertChildren(child);
                } else {
                    /**
                     * 判断child是否为 Component，ElementWrapper，TextWrapper 这些类的实例，都不是那就当字符串处理
                     * 一般都不是的都标签内的文本
                     */
                    if (
                        !(child instanceof Component) &&
                        !(child instanceof ElementWrapper) &&
                        !(child instanceof TextWrapper)
                    ) {
                        child = String(child);
                    }
                    /**
                     * 类型为字符串就。。。
                     */
                    if (typeof child === "string") {
                        child = new TextWrapper(child);
                    }

                    element.appendChild(child);
                }
            }
        };
        insertChildren(children);
        return element;
    },
    render(vdom, element) {
        let range = document.createRange();
        if (element.children.length) {
            range.setStartAfter(element.lastChild);
            range.setEndAfter(element.lastChild);
        } else {
            range.setStart(element, 0);
            range.setEnd(element, 0);
        }
        vdom.mountTo(range);
    }, 
};

ToyReact.Component = Component

export default ToyReact
