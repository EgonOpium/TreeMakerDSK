import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  id: string;
  name: string;
  type: string;
  failure_rate: number;
  desc?: string;
  k?: number;
  dialog: string;
}

@Component({
  selector: 'app-tree-making-dialog',
  templateUrl: './tree-making-dialog.component.html',
  styleUrls: ['./tree-making-dialog.component.css']
})
export class TreeMakingDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<TreeMakingDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
