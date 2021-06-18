import { Component, OnInit, Injectable } from '@angular/core';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
 export class EventNode {
  id: string;
  desc?: string;
  propability: number;
  children: EventNode[];
  plus?:boolean;
}

let TREE_DATA: EventNode[] = [
  {
    id: 'EventFirst',
    desc: 'egg2',
    propability: 0.5,
    children: [
      {id: 'BasicEvent1',
      propability: 0.5,
      children:[]
      },
      {id: 'BasicEvent2',
      propability: 0.5,
      children:[]},
      {id: 'BasicEvent3',
      propability: 0.5,
      children:[]},
    ]
  }, {
    id: 'EventSecond',
    propability: 0.5,
    children: [
      {
        id: 'BasicEvent4',
        propability: 0.5,
        children: [
          {id: 'BasicEvent6',
          propability: 0.5,
          children:[]},
          {id: 'BasicEvent7',
          propability: 0.5,
          children:[]},
        ]
      }, {
        id: 'BasicEvent5',
        propability: 0.5,
        children: [
          {id: 'BasicEvent8',
          propability: 0.5,
          children:[]},
          {id: 'BasicEvent9',
          propability: 0.5,
          children:[]},
        ]
      },
    ]
  },
];


export class TreeDataSource extends MatTreeNestedDataSource<EventNode> {
  constructor(
    private treeControl: NestedTreeControl<EventNode>,
    intialData: EventNode[]
  ) {
    super();
    this._data.next(intialData);
  }
  /** Add node as child of parent */
  public add(node: EventNode, parent: EventNode) {
    // add dummy root so we only have to deal with `FoodNode`s
    const newTreeData = { id: "Dummy Root", children: this.data, propability: 0.2 };
    this._add(node, parent, newTreeData);
    this.data = newTreeData.children;
  }

  protected _add(newNode: EventNode, parent: EventNode, tree: EventNode):any {
    if (tree === parent) {
      console.log(
        `replacing children array of '${parent.id}', adding ${newNode.id}`
      );
      tree.children = [...tree.children!, newNode];
      this.treeControl.expand(tree);
      return true;
    }
    if (!tree.children) {
      console.log(`reached leaf node '${tree.id}', backing out`);
      return false;
    }
    return this.update(tree, this._add.bind(this, newNode, parent));
  }

  public remove(node: EventNode) {
    const newTreeData = { name: "Dummy Root", children: this.data, id: node.id, propability: node.propability };
    this._remove(node, newTreeData);
    this.data = newTreeData.children;
  }

  _remove(node: EventNode, tree: EventNode): boolean {
    if (!tree.children) {
      return false;
    }
    const i = tree.children.indexOf(node);
    if (i > -1) {
      tree.children = [
        ...tree.children.slice(0, i),
        ...tree.children.slice(i + 1)
      ];
      this.treeControl.collapse(node);
      console.log(`found ${node.id}, removing it from`, tree);
      return true;
    }
    return this.update(tree, this._remove.bind(this, node));
  }

  protected update(tree: EventNode, predicate: (n: EventNode) => boolean) {
    let updatedTree: EventNode, updatedIndex: number;

    tree.children!.find((node, i) => {
      if (predicate(node)) {
        console.log(`creating new node for '${node.id}'`);
        updatedTree = { ...node };
        updatedIndex = i;
        this.moveExpansionState(node, updatedTree);
        return true;
      }
      return false;
    });

    if (updatedTree!) {
      console.log(`replacing node '${tree.children![updatedIndex!].id}'`);
      tree.children![updatedIndex!] = updatedTree!;
      return true;
    }
    return false;
  }

  moveExpansionState(from: EventNode, to: EventNode) {
    if (this.treeControl.isExpanded(from)) {
      console.log(`'${from.id}' was expanded, setting expanded on new node`);
      this.treeControl.collapse(from);
      this.treeControl.expand(to);
    }
  }
}


@Component({
  selector: 'app-tree-making',
  templateUrl: './tree-making.component.html',
  styleUrls: ['./tree-making.component.css'],
})
export class TreeMakingComponent implements OnInit {
  treeControl = new NestedTreeControl<EventNode>(node => node.children);
  dataSource = new TreeDataSource(this.treeControl, TREE_DATA);
  downloadJsonHref: any;
  theJSON: string;


  constructor(private sanitizer: DomSanitizer) 
  {
    
  }
  
  ngOnInit(): void {
  }
  
  hasChild = (_: number, node: EventNode) => !!node.children && node.children.length > 0;
  clickedPlus = (_:boolean, node:EventNode) => node.plus;


  getAncestors(array:Array<EventNode>, id:string):any {
    if (typeof array != "undefined") {
      for (let i = 0; i < array.length; i++) {
        if (array[i].id === id) {
          return [array[i]];
        }
        const a = this.getAncestors(array[i].children, id);
        if (a !== null) {
          a.unshift(array[i]);
          return a;
        }
      }
    }
    return null;
  }

  onLeafNodeClick(node: EventNode): void {
    if(node.plus == true){node.plus=false} else {node.plus = true;}
    const ancestors = this.getAncestors(this.dataSource.data, node.id);
    console.log("ancestors ", ancestors);

    // this.treeControl.collapse(ancestors[0]);
    console.log("direct parent  ", ancestors[ancestors.length - 2]);
    let breadcrumbs = "";
    ancestors.forEach((ancestor:any) => {
      breadcrumbs += `${ancestor.id}/`;
    });
    console.log("breadcrumbs ", breadcrumbs);
  }

  generateDownloadJsonUri() {
    this.theJSON = JSON.stringify(TREE_DATA);
    var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(this.theJSON));
    this.downloadJsonHref = uri;
  }

  addGin(node:EventNode){
    
    this.dataSource.add({id: "node", propability:0.2, children: []},node);

    // console.log("Saved: "+node.id+", string: "+value);
    // const ancestors = this.getAncestors(this.dataSource.data, node.id);
    
    // var foundEle = ancestors[ancestors.length - 1];
    // console.log("found: "+foundEle?.id)
    // let newObject = {
    //   id: value,
    //   desc: 'egg2',
    //   propability: 0.5,
    //   children: []};
    // this.dataSource.data.find(t => t.id == foundEle.id)?.children.push(newObject);

    
  }

  remove(node: EventNode) {
    this.dataSource.remove(node);
  }
}
