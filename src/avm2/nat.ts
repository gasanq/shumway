/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
///<reference path='references.ts' />

interface Object {
  __proto__: Object;
}

interface JSObject extends Object {}
interface JSFunction extends Function {}

module Shumway.AVM2.AS {
  import ClassInfo = Shumway.AVM2.ABC.ClassInfo;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import Namespace = Shumway.AVM2.ABC.Namespace;
  import ApplicationDomain = Shumway.AVM2.Runtime.ApplicationDomain;
  import hasOwnProperty = Shumway.ObjectUtilities.hasOwnProperty;

  var writer = new Shumway.IndentingWriter();

  /**
   * This is all very magical, things are not what they seem, beware!!!
   *
   * The AS3 Class Hierarchy can be expressed as TypeScript, which is nice because
   * we get all sorts of compile time error checking and default arguments support.
   *
   * For the most part, you can cut and paste AS3 code into TypeScript and it will
   * parse correctly.
   *
   * The prototype chain configured by TypeScript is not actually used, We only use
   * Class definitions as a templates from which we construct real AS3 classes.
   *
   * Linking:
   *
   * AS -> TS
   *
   * Native AS3 members are linked against TS members. A verification step makes
   * sure all native members are implemented.
   *
   * TS -> AS
   *
   * For this you need to provide TS type definitions and then specify which
   * properties should be made available.
   *
   */
  export class Object {
    public static asConstructor: any = jsGlobal.Object;

    static _setPropertyIsEnumerable(o, V: string, enumerable: boolean): void {
      Debug.notImplemented("_setPropertyIsEnumerable");
    }

    static _hasOwnProperty(o, V: string): boolean {
      Debug.notImplemented("_hasOwnProperty");
      return false;
    }

    static _propertyIsEnumerable(o, V: string): boolean {
      Debug.notImplemented("_propertyIsEnumerable");
      return false;
    }

    static _isPrototypeOf(o, V): boolean {
      Debug.notImplemented("_isPrototypeOf");
      return false;
    }

    static _toString(o): string {
      Debug.notImplemented("_toString");
      return "";
    }

    // Hack to make the TypeScript compiler find the original Object.defineProperty.
    static defineProperty = jsGlobal.Object.defineProperty;

    isPrototypeOf(V = undefined): boolean {
      Debug.notImplemented("isPrototypeOf");
      return false;
    }

    hasOwnProperty(V = undefined): boolean {
      Debug.notImplemented("hasOwnProperty");
      return false;
    }

    propertyIsEnumerable(V = undefined): boolean {
      Debug.notImplemented("propertyIsEnumerable");
      return false;
    }
  }

  export interface IClassTemplate {
    asConstructor: new (...args) => any;
    staticDelegates?: any [];
    instanceDelegates?: any [];
    prototype: any;
  }

  export class Class extends Object implements IClassTemplate {
    classInfo: ClassInfo;
    asConstructor: new (...args) => any;
    template: IClassTemplate;
    staticDelegates: JSObject [];
    instanceDelegates: JSObject [];
    constructor(classInfo: ClassInfo, template: IClassTemplate) {
      super();
      this.classInfo = classInfo;
      this.asConstructor = template.asConstructor;
      this.template = template;
    }
    get prototype() {
      Debug.notImplemented("get prototype");
      return {};
    }
    verify() {
      // Verify that we have bindings for all native traits.
      writer && writer.enter("Verify Template: " + this.classInfo + " {");
      var traits = [this.classInfo.traits, this.classInfo.instanceInfo.traits];

      var staticHolders: JSObject [] = [this.template];
      if (this.template.staticDelegates) {
        Shumway.ArrayUtilities.pushMany(staticHolders, this.template.staticDelegates);
      }
      var instanceHolders: JSObject [] = [this.template.prototype];
      if (this.template.instanceDelegates) {
        Shumway.ArrayUtilities.pushMany(instanceHolders, this.template.instanceDelegates);
      }

      function has(objects: JSObject [], predicate: (object: JSObject, name: string) => boolean, name) {
        for (var i = 0; i < objects.length; i++) {
          if (predicate(objects[i], name)) {
            return true;
          }
        }
        return false;
      }

      for (var j = 0; j < traits.length; j++) {
        var isClassTrait = j === 0;
        for (var i = 0; i < traits[j].length; i++) {
          var trait = traits[j][i];
          var name = trait.name.name;
          if (!(trait.isMethodOrAccessor() && trait.methodInfo.isNative())) {
            continue;
          }
          var holders = isClassTrait ? staticHolders : instanceHolders;
          var hasDefinition = false;
          if (trait.isMethod()) {
            hasDefinition = has(holders, Shumway.ObjectUtilities.hasOwnProperty, name);
          } else if (trait.isGetter()) {
            hasDefinition = has(holders, Shumway.ObjectUtilities.hasOwnGetter, name);
          } else if (trait.isSetter()) {
            hasDefinition = has(holders, Shumway.ObjectUtilities.hasOwnSetter, name);
          }
          if (!hasDefinition) {
            warn("Template is missing an implementation of the native " + (isClassTrait ? "static" : "instance") + " trait: " + trait + " in class: " + this.classInfo);
          }
          // Debug.assert(hasDefinition, "Template is missing an implementation of the native " + (isClassTrait ? "static" : "instance") + " trait: " + trait + " in class: " + this.classInfo);
        }
      }

      writer && writer.leave("}");
      Debug.assert(this.asConstructor, "Must have a constructor function.");
    }
  }

  export class Function extends Object {
    public static asConstructor: any = jsGlobal.Function;
    constructor() {
      super();
    }
    get prototype() {
      Debug.notImplemented("get prototype");
      return {};
    }
    set prototype(p) {
      Debug.notImplemented("set prototype");
    }
    get length(): number {
      Debug.notImplemented("get length");
      return 0;
    }
    call(self = undefined, ...args: any []) {
      Debug.notImplemented("call");
    }
    apply(self = undefined, args: any [] = undefined) {
      Debug.notImplemented("apply");
    }
  }

  export class Boolean extends Object {
    public static asConstructor: any = jsGlobal.Boolean;

    constructor(value: any = undefined) {
      super();
    }

    toString() {
      Debug.notImplemented("toString");
    }

    valueOf() {
      Debug.notImplemented("valueOf");
    }
  }

  export class MethodClosure extends Function {
    public static asConstructor: any = function methodClosure(self, fn) {
      var bound = Shumway.FunctionUtilities.bindSafely(fn, self);
      Shumway.ObjectUtilities.defineNonEnumerableProperty(this, "call", bound.call.bind(bound));
      Shumway.ObjectUtilities.defineNonEnumerableProperty(this, "apply", bound.apply.bind(bound));
    };
    constructor(value: any = undefined) {
      super();
    }
  }

  export class Namespace extends Object {
    public static asConstructor: any = function(prefix: string = undefined, uri: string = undefined) {

    }

    get prefix(): any { Debug.notImplemented("get prefix"); return; }
    get uri(): String { Debug.notImplemented("get uri"); return; }
  }

  export class Number extends Object {
    public static asConstructor: any = jsGlobal.Number;
    public static staticDelegates: any [] = [jsGlobal.Math];
    public static instanceDelegates: any [] = [jsGlobal.Number.prototype];

    static _numberToString(n: number, radix: number): string { Debug.notImplemented("_numberToString"); return; }
    static _convert(n: number, precision: number, mode: number): string { Debug.notImplemented("_convert"); return; }
    static _minValue(): number { Debug.notImplemented("_minValue"); return; }


  }

  export class Int extends Object {
    public static asConstructor: any = jsGlobal.Number;
  }

  export class Uint extends Object {
    public static asConstructor: any = jsGlobal.Number;
  }

  export class String extends Object {
    public static asConstructor: any = jsGlobal.String;
    public static staticDelegates: any [] = [jsGlobal.String];
    public static instanceDelegates: any [] = [jsGlobal.String.prototype];
  }

  export class Array extends Object {
    public static asConstructor: any = jsGlobal.Array;
  }

  export class Vector<T> extends Object {
    public static asConstructor: any = jsGlobal.Array;
  }

  export class ObjectVector extends Object {
    public static asConstructor: any = jsGlobal.Array;
  }

  export class IntVector extends Object {
    public static asConstructor: any = jsGlobal.Array;
  }

  export class UIntVector extends Object {
    public static asConstructor: any = jsGlobal.Array;
  }

  export class DoubleVector extends Object {
    public static asConstructor: any = jsGlobal.Array;
  }

  export class JSON extends Object {
    public static asConstructor: any = jsGlobal.Array;
  }

  export class XML extends Object {
    public static asConstructor: any = jsGlobal.Array;
  }

  export class XMLList extends Object {
    public static asConstructor: any = jsGlobal.Array;
  }

  export class QName extends Object {
    public static asConstructor: any = jsGlobal.Array;
  }

  export class Error extends Object {
    public static asConstructor: any = jsGlobal.Array;
    constructor(message = "", id = 0) {
      super();
    }
  }

  var nativeClasses: Shumway.Map<Class> = Shumway.ObjectUtilities.createMap<Class>();

  var isInitialized: boolean = false;
  export function initialize(domain: ApplicationDomain) {
    if (isInitialized) {
      return;
    }
    function findClassInfo(name: string) {
      return domain.findClassInfo(Multiname.fromSimpleName(name));
    }
    function findVectorClassInfo(name: string) {
      return domain.findClassInfo(new Multiname([Shumway.AVM2.ABC.Namespace.VECTOR_PACKAGE], name));
    }
    nativeClasses["ObjectClass"] = new Class(findClassInfo("Object"), Object);
    nativeClasses["Class"] = new Class(findClassInfo("Class"), Class);
    nativeClasses["FunctionClass"] = new Class(findClassInfo("Function"), Function);
    nativeClasses["BooleanClass"] = new Class(findClassInfo("Boolean"), Boolean);
    nativeClasses["MethodClosureClass"] = new Class(domain.findClassInfo(new Multiname([Shumway.AVM2.ABC.Namespace.BUILTIN], "MethodClosure")), MethodClosure);
    nativeClasses["NamespaceClass"] = new Class(findClassInfo("Namespace"), Namespace);
    nativeClasses["NumberClass"] = new Class(findClassInfo("Number"), Number);
    nativeClasses["intClass"] = new Class(findClassInfo("int"), Int);
    nativeClasses["uintClass"] = new Class(findClassInfo("uint"), Uint);
    nativeClasses["StringClass"] = new Class(findClassInfo("String"), String);
    nativeClasses["ArrayClass"] = new Class(findClassInfo("Array"), Array);
    nativeClasses["VectorClass"] = new Class(domain.findClassInfo(new Multiname([Shumway.AVM2.ABC.Namespace.VECTOR], "Vector")), Vector);
    nativeClasses["ObjectVectorClass"] = new Class(findVectorClassInfo("Vector$object"), ObjectVector);
    nativeClasses["IntVectorClass"] = new Class(findVectorClassInfo("Vector$int"), IntVector);
    nativeClasses["UIntVectorClass"] = new Class(findVectorClassInfo("Vector$uint"), UIntVector);
    nativeClasses["DoubleVectorClass"] = new Class(findVectorClassInfo("Vector$double"), DoubleVector);
    nativeClasses["JSONClass"] = new Class(findClassInfo("JSON"), JSON);
    nativeClasses["XMLClass"] = new Class(findClassInfo("XML"), XML);
    nativeClasses["XMLListClass"] = new Class(findClassInfo("XMLList"), XMLList);
    nativeClasses["QNameClass"] = new Class(findClassInfo("QName"), QName);
    isInitialized = true;

    for (var k in nativeClasses) {
      nativeClasses[k].verify();
    }
  }

  export function createNativeClass(classInfo: ClassInfo) {
    assert (classInfo.native);
    var nativeName = classInfo.native.cls
    var cls = nativeClasses[nativeName];
    Debug.assert(cls, "Class " + nativeName + " not found.");
    cls.verify();
    return cls;
  }
}