import { Component, OnInit, Injectable } from '@angular/core';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';
import { DomSanitizer } from '@angular/platform-browser';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { DialogData, TreeMakingDialogComponent } from '../tree-making-dialog/tree-making-dialog.component';

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
export interface Gate{
}
 export interface BasicEvent {
  id:           string;
  desc:         string;
  failure_rate: number;
  gate:  Gate;
}
export interface ORGate extends Gate{
  id:           string;
  desc:         string;
  failure_rate: number;
  subelements:  BasicEvent[];
}
export interface KNGate extends Gate{
  id:           string;
  desc:         string;
  failure_rate: number;
  k:            number;
  subelements:  BasicEvent[];
}


 interface EventNode {
  id: string;
  desc?: string;
  failure_rate?: number;
  children: EventNode[];
  plus?:boolean;
  type: string; //event / gate
}

let BasicEvent: EventNode[] = [
  {
    id: 'EventFirst',
    type: 'event',
    desc: 'egg2',
    failure_rate: 0.5,
    children: [
      {id: 'BasicEvent1',
      type: 'event',
      failure_rate: 0.5,
      children:[]
      },
      {id: 'BasicEvent2',
      type: 'event',
      failure_rate: 0.5,
      children:[]},
      {id: 'BasicEvent3',
      type: 'event',
      failure_rate: 0.5,
      children:[]},
    ]
  }, {
    id: 'EventSecond',
    failure_rate: 0.5,
    type: 'event',
    children: [
      {
        id: 'BasicEvent4',
        type: 'event',
        failure_rate: 0.5,
        children: [
          {id: 'BasicEvent6',
          type: 'event',
          failure_rate: 0.5,
          children:[]},
          {id: 'BasicEvent7',
          type: 'event',
          failure_rate: 0.5,
          children:[]},
        ]
      }, {
        id: 'BasicEvent5',
        type: 'event',
        failure_rate: 0.5,
        children: [
          {id: 'BasicEvent8',
          type: 'event',
          failure_rate: 0.5,
          children:[]},
          {id: 'BasicEvent9',
          type: 'event',
          failure_rate: 0.5,
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
    const newTreeData = { id: "Dummy Root", children: this.data, failure_rate: 0.2, type: 'event' };
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
    const newTreeData = { name: "Dummy Root", children: this.data, id: node.id, failure_rate: node.failure_rate, type: 'event' };
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
  dataSource = new TreeDataSource(this.treeControl, BasicEvent);
  downloadJsonHref: any;
  theJSON: string;

  id: number;
  desc: string;
  dialogData: DialogData;
  constructor(private sanitizer: DomSanitizer, public dialog: MatDialog) 
  {
    
  }
  openAddGateDialog(node: EventNode): void {
    const dialogRef = this.dialog.open(TreeMakingDialogComponent, {
      width: '450px',
      data: {id: node.id, desc: this.desc, type: "gate"}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if(result != null){
        this.dialogData = result;
        
      }
    });
  }
  openAddEventDialog(node: EventNode): void {
    const dialogRef = this.dialog.open(TreeMakingDialogComponent, {
      width: '450px',
      data: {id: node.id, desc: this.desc, type: "event"}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if(result != null){
        this.dialogData = result;
        
      }
    });
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

  makeList(){
    BasicEvent.forEach(element => {
      
    });
  }

  generateDownloadJsonUri() {
    this.theJSON = JSON.stringify({BasicEvent});
    console.log(this.theJSON)
    var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(this.theJSON));
    this.downloadJsonHref = uri;
  }

  addEvent(node:EventNode){
    this.dataSource.add({id: "node", failure_rate:0.2, children: [], type: 'event'},node);
    console.log(node.children.length);
  }

  addGate(node:EventNode){
    this.dataSource.add({id: "gate", failure_rate:0.2, children: [], type: 'gate'},node);
    // this.dataSource.add(name: "BasicEvent", {{id: "gate", failure_rate:0.2, children: [], type: 'gate'}},node)
  }

  remove(node: EventNode) {
    this.dataSource.remove(node);
  }
}
