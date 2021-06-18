import { Component, OnInit } from '@angular/core';
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
  prop: {
    propability: number;
  }
  children?: EventNode[];
}

export class  EventFlat{
  id: string;
  level: number;
  expandable: boolean;
}

const TREE_DATA: EventNode[] = [
  {
    id: 'EventFirst',
    desc: 'egg2',
    prop:{
      propability: 0.5
    },
    children: [
      {id: 'BasicEvent1',
        prop:{
          propability: 0.2
        }
      },
      {id: 'BasicEvent2',
      prop:{
        propability: 0.2
      }},
      {id: 'BasicEvent3',
      prop:{
        propability: 0.2
      }},
    ]
  }, {
    id: 'EventSecond',
    prop:{
      propability: 0.2
    },
    children: [
      {
        id: 'BasicEvent4',
        prop:{
          propability: 0.2
        },
        children: [
          {id: 'BasicEvent6',
          prop:{
            propability: 0.2
          }},
          {id: 'BasicEvent7',
          prop:{
            propability: 0.2
          }},
        ]
      }, {
        id: 'BasicEvent5',
        prop:{
          propability: 0.2
        },
        children: [
          {id: 'BasicEvent8',
          prop:{
            propability: 0.2
          }},
          {id: 'BasicEvent9',
          prop:{
            propability: 0.2
          }},
        ]
      },
    ]
  },
];



@Component({
  selector: 'app-tree-making',
  templateUrl: './tree-making.component.html',
  styleUrls: ['./tree-making.component.css']
})
export class TreeMakingComponent implements OnInit {
  treeControl = new NestedTreeControl<EventNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<EventNode>();
  downloadJsonHref: any;
  theJSON: string;

  // NEW THINGS TO MAKE ADDING WORK

  constructor(private sanitizer: DomSanitizer) { 
    this.dataSource.data = TREE_DATA;
  }
  
  ngOnInit(): void {
  }
  hasChild = (_: number, node: EventNode) => !!node.children && node.children.length > 0;
  hasPropability = (_: boolean, node: EventNode) => node.prop?.propability != null;

  addNewItem(node: EventNode){

  }

  generateDownloadJsonUri() {
    this.theJSON = JSON.stringify(TREE_DATA);
    var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(this.theJSON));
    this.downloadJsonHref = uri;
  }
}


// ----------------------------------------------------

// export class TreeChecklistExample {
//   /** Map from flat node to nested node. This helps us finding the nested node to be modified */
//   flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

//   /** Map from nested node to flattened node. This helps us to keep the same object for selection */
//   nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

//   /** A selected parent node to be inserted */
//   selectedParent: TodoItemFlatNode | null = null;

//   /** The new item's name */
//   newItemName = '';

//   treeControl: FlatTreeControl<TodoItemFlatNode>;

//   treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

//   dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

//   /** The selection for checklist */
//   checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

//   constructor(private _database: ChecklistDatabase) {
//     this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
//       this.isExpandable, this.getChildren);
//     this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
//     this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

//     _database.dataChange.subscribe(data => {
//       this.dataSource.data = data;
//     });
//   }

//   getLevel = (node: TodoItemFlatNode) => node.level;

//   isExpandable = (node: TodoItemFlatNode) => node.expandable;

//   getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

//   hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

//   hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

//   /**
//    * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
//    */
//   transformer = (node: TodoItemNode, level: number) => {
//     const existingNode = this.nestedNodeMap.get(node);
//     const flatNode = existingNode && existingNode.item === node.item
//         ? existingNode
//         : new TodoItemFlatNode();
//     flatNode.item = node.item;
//     flatNode.level = level;
//     flatNode.expandable = !!node.children?.length;
//     this.flatNodeMap.set(flatNode, node);
//     this.nestedNodeMap.set(node, flatNode);
//     return flatNode;
//   }

//   /* Get the parent node of a node */
//   getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
//     const currentLevel = this.getLevel(node);

//     if (currentLevel < 1) {
//       return null;
//     }

//     const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

//     for (let i = startIndex; i >= 0; i--) {
//       const currentNode = this.treeControl.dataNodes[i];

//       if (this.getLevel(currentNode) < currentLevel) {
//         return currentNode;
//       }
//     }
//     return null;
//   }

//   /** Select the category so we can insert the new item. */
//   addNewItem(node: TodoItemFlatNode) {
//     const parentNode = this.flatNodeMap.get(node);
//     this._database.insertItem(parentNode!, '');
//     this.treeControl.expand(node);
//   }

//   /** Save the node to database */
//   saveNode(node: TodoItemFlatNode, itemValue: string) {
//     const nestedNode = this.flatNodeMap.get(node);
//     this._database.updateItem(nestedNode!, itemValue);
//   }
// }