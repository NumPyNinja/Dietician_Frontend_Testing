import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common'
import { ReadpatientsService } from '../readpatients.service';
import { Patient } from '../patient';
import { UserService } from 'src/app/UserService/user.service';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FilterService } from 'primeng/api';

@Component({
  selector: 'app-readpatients',
  templateUrl: './readpatients.component.html',
  styleUrls: ['./readpatients.component.css'],

  styles: [
    `
      :host ::ng-deep .p-dialog .product-image {
        width: 250px;
        margin: 0 auto 2rem auto;
        display: block;
      }
    `,
  ],
})
export class ReadpatientsComponent implements OnInit {
  visibility: boolean = false;
  patients: Patient[] = [];
  patient: Patient = {};
  submitted: boolean;
  userId: number;

  patientDialogue: boolean;
  testReportsDialogue: boolean = false;

  isLoaded = true;
  testPatientDialogue: boolean = false;

  datePipe: DatePipe = new DatePipe('en-US');

  constructor(private readPatientsService: ReadpatientsService,
    private userService: UserService,
    private filterService: FilterService,
    public dialog: MatDialog) { }

   ngOnInit(): void {
    this.configureFilterService();
    this.getPatients();
    this.userService.Refreshrequired.subscribe(response => {
      this.getPatients();
    });
  }


  private configureFilterService() {
    let containsFilter = this.filterService.filters['contains']; //handle to original built in filter
    // @ts-ignore
    this.filterService.register('containsWithDateFormat', (value, filter): boolean => {
      if (filter === undefined || filter === null || filter.trim() === '') {
        return true;
      }
      if (value === undefined || value === null) {
        return false;
      }
      if (value instanceof Date || Date.parse(value)) {
        // @ts-ignore
        let formattedDate = this.datePipe.transform(value, 'dd-MM-yyyy')
        // @ts-ignore
        return formattedDate.toString().includes(filter.toString());
      } else {
        return containsFilter(value, filter); // default to original
      }
    });
  }

  openNew() {
    this.patient = {};
    this.submitted = false;
  }
  
  hideDialog() {
    this.patientDialogue = false;
    this.submitted = false;
  }


  private getPatients() {
    this.visibility = true;

    this.isLoaded = false;
    this.readPatientsService.getPatients().subscribe((res) => {
      this.patients = res;
      this.visibility = false;
      this.isLoaded = true;

    });

  }

  viewTestReports(patient: Patient) {
    this.patient = patient;
    this.testReportsDialogue = true;
  }

  viewPresentDietPlans(patient: Patient) {

  }

  createNewReportOrDietPlan(patient: Patient) {

  }

  deletePatient(patient: Patient) {

    this.readPatientsService.deletePatient(patient).subscribe(
      {
        next: (res) => {
          alert(res);
          this.getPatients();
        },
        error: (error) => { alert("Error Deleting Patient"); }
      })

  }


  editPatient(patient: Patient) {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';
    dialogConfig.data = {
      isUpdate: !!patient,
      patient: patient,
      patientId: patient.patientId // pass patientId here 


    };

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig,);

    dialogRef.afterClosed().subscribe(result => {

      console.log('The dialog was closed');
    });
  }

  savePatient() {
  }

}

