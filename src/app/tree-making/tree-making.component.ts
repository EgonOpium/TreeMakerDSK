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
 export class EventNode {
  id: string;
  desc?: string;
  failure_rate?: number;
  k?: number;
  plus?:boolean;
  type: string; //event / gate
  subelements: EventNode[];
}

let TREE_DATA: EventNode[] = [
  {
    id: 'EventFirst',
    type: 'BasicEvent',
    desc: 'egg2',
    failure_rate: 0.5,
    subelements: [
      {
        id: 'KNGate',
        type: 'KNGate',
        failure_rate: 0.5,
        subelements:[
          {id: 'BasicEvent2',
            type: 'BasicEvent',
            failure_rate: 0.5,
            subelements:[]},
          {id: 'BasicEvent3',
            type: 'BasicEvent',
            failure_rate: 0.5,
            subelements:[]}
        ]
      },
    ]
  }
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
    const newTreeData = { id: "Dummy Root", subelements: this.data, failure_rate: 0.2, type: 'event' };
    this._add(node, parent, newTreeData);
    this.data = newTreeData.subelements;
  }

  protected _add(newNode: EventNode, parent: EventNode, tree: EventNode):any {
    if (tree === parent) {
      console.log(
        `replacing subelements array of '${parent.id}', adding ${newNode.id}`
      );
      tree.subelements = [...tree.subelements!, newNode];
      this.treeControl.expand(tree);
      return true;
    }
    if (!tree.subelements) {
      console.log(`reached leaf node '${tree.id}', backing out`);
      return false;
    }
    return this.update(tree, this._add.bind(this, newNode, parent));
  }

  public remove(node: EventNode) {
    const newTreeData = { name: "Dummy Root", subelements: this.data, id: node.id, failure_rate: node.failure_rate, type: 'event' };
    this._remove(node, newTreeData);
    this.data = newTreeData.subelements;
  }

  _remove(node: EventNode, tree: EventNode): boolean {
    if (!tree.subelements) {
      return false;
    }
    const i = tree.subelements.indexOf(node);
    if (i > -1) {
      tree.subelements = [
        ...tree.subelements.slice(0, i),
        ...tree.subelements.slice(i + 1)
      ];
      this.treeControl.collapse(node);
      console.log(`found ${node.id}, removing it from`, tree);
      return true;
    }
    return this.update(tree, this._remove.bind(this, node));
  }

  protected update(tree: EventNode, predicate: (n: EventNode) => boolean) {
    let updatedTree: EventNode, updatedIndex: number;

    tree.subelements!.find((node, i) => {
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
      console.log(`replacing node '${tree.subelements![updatedIndex!].id}'`);
      tree.subelements![updatedIndex!] = updatedTree!;
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
  treeControl = new NestedTreeControl<EventNode>(node => node.subelements);
  dataSource = new TreeDataSource(this.treeControl, TREE_DATA);
  downloadJsonHref: any;
  theJSON: string;

  id: number;
 
  dialogData: DialogData;
  constructor(private sanitizer: DomSanitizer, public dialog: MatDialog) 
  {
    
  }
  openAddGateDialog(node: EventNode): void {
    const dialogRef = this.dialog.open(TreeMakingDialogComponent, {
      width: '450px',
      data: {id: node.id, dialog: "gate"}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if(result != null){
        this.dialogData = result;
        
        this.addGate(node,this.dialogData.type,this.dialogData.desc,this.dialogData.k);
      }
    });
  }
  openAddEventDialog(node: EventNode): void {
    const dialogRef = this.dialog.open(TreeMakingDialogComponent, {
      width: '450px',
      data: {id: node.id, dialog: "event"}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if(result != null){
        this.dialogData = result;
        this.addEvent(node, this.dialogData.type, this.dialogData.failure_rate);
      }
    });
  }
  
  ngOnInit(): void {
  }
  
  hasChild = (_: number, node: EventNode) => !!node.subelements && node.subelements.length > 0;
  clickedPlus = (_:boolean, node:EventNode) => node.plus;


  getAncestors(array:Array<EventNode>, id:string):any {
    if (typeof array != "undefined") {
      for (let i = 0; i < array.length; i++) {
        if (array[i].id === id) {
          return [array[i]];
        }
        const a = this.getAncestors(array[i].subelements, id);
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
    this.theJSON = JSON.stringify(TREE_DATA, null, '\t');
    var newStr = this.theJSON.substring(1, this.theJSON.length-1);
    
    var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(newStr));
    this.downloadJsonHref = uri;
  }

  addEvent(node:EventNode, type:string, fail:number){
    this.dataSource.add({id: type, failure_rate:fail, type: type, subelements: []},node);
    console.log(node.subelements.length);
  }

  addGate(node:EventNode,type:string, descr?:string,k? : number){
    this.dataSource.add({id: type, failure_rate:0.2, type: type, k: 2, subelements: []},node);
  }

  remove(node: EventNode) {
    this.dataSource.remove(node);
  }
}
