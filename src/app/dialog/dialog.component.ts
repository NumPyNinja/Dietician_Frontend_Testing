import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../UserService/user.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Patient } from '../readpatients/patient';
import { UtilityService } from '../shared/utility.service';
import { HttpErrorResponse } from '@angular/common/http';


interface Allergy {
  value: string;
  viewValue: string;
}
interface Food {
  val: string;
  viewVal: string;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  dialogTitle: string = 'Add Patient Details';
  patientForm !: FormGroup;
  public userFile: any = File;
  reportFile: File;
  patientId: number;
  patient: Patient;
  isUpdate: boolean = false;
  maxDate: any;
  selectedAllergies: string;
  numRegex = /^(?![a-zA-Z])\d*[.,]?\d{0,1}$/;
     
  allergies: Allergy[] = [{ value: 'none', viewValue: 'None' },
    { value: 'egg-0', viewValue: 'Egg' },
  { value: 'milk-1', viewValue: 'Milk' },
  { value: 'soy-2', viewValue: 'Soy' },
  { value: 'almond-3', viewValue: 'Almond' },
  { value: 'peanut-4', viewValue: 'Peanut' },
  { value: 'walnut-5', viewValue: 'Walnut' },
  { value: 'pistachio-6', viewValue: 'Pistachio' },
  { value: 'sesame-7', viewValue: 'Sesame' },
  { value: 'hazelnut-8', viewValue: 'Hazelnut' },
  { value: 'pecan-10', viewValue: 'Pecan' },
  { value: 'cashew-11', viewValue: 'Cashew' }]
  selectedFood: string;
  foods: Food[] = [{ val: 'vegan-0', viewVal: 'Vegan' },
  { val: 'vegetarian-1', viewVal: 'Vegetarian' },
  { val: 'jain-2', viewVal: 'Jain' },
  { val: 'eggetarian-3', viewVal: 'Eggetarian' },
  { val: 'nonveg-4', viewVal: 'NonVeg' },
  ]
  userFiles: File[] = [];
  uploadedFileNames: string[] = [];

  constructor(private fb: FormBuilder, private userService: UserService, private dialogRef: MatDialogRef<DialogComponent>,
    private utilityService: UtilityService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isUpdate = false;
  }


  ngOnInit(): void {
    this.patientForm = this.fb.group({
      FirstName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]+$/)]],
      LastName: ['',  [Validators.required, Validators.pattern(/^[a-zA-Z ]+$/)]],
      Email: ['', [Validators.required, Validators.email]],
      ContactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      Allergy: [''],
      FoodCategory: [''],
      DateOfBirth: ['', Validators.required],
      Weight: ['', [Validators.min(0), Validators.max(250), Validators.pattern(this.numRegex)]],
      Height: ['', Validators.pattern(/^(?!-)([0-6]?\d(\.\d{1,2})?|7[0-9](\.\d{1,2})?|84)$/)],
      Temperature: ['', Validators.pattern(/^(9[5-9]|[1][0-9][0-7])(\.\d)?$/)],
      SP: ['', [Validators.pattern(/^\d{2,3}$/)]],
      DP: ['', Validators.pattern(/^\d{2,3}$/)]
    });

    if (this.data && this.data.isUpdate) {
      this.isUpdate = true;
      this.patientId = this.data.patientId;
      const patientData = this.data.patient;
      this.selectedAllergies = patientData.Allergy;
      this.selectedFood = patientData.FoodCategory;
      this.patientForm.patchValue(patientData)
      this.dialogTitle = 'Update Patient Details';
    }
  }

  futureDateDisable() {
    var date: any = new Date();
    var todayDate: any = date.getDate();
    var month: any = date.getMonth() + 1;
    var year: any = date.getFullYear();
    if (todayDate < 10) {
      todayDate = '0' + todayDate;
    }
    if (month < 10) {
      month = '0' + month;
    }
    this.maxDate = year + "-" + month + "-" + todayDate + "T05:00:00.000+00:00";
  }


  addPatient(patientForm: FormGroup) {
    if (this.patientForm.valid) {

      const formData = { ...this.patientForm.value };
      formData.Allergy = this.selectedAllergies;
      formData.FoodCategory = this.selectedFood;
      const dateOfBirth = new Date(formData.DateOfBirth);
      const formattedDateOfBirth = dateOfBirth.toISOString().split('T')[0];
      formData.DateOfBirth = formattedDateOfBirth;
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('patientInfo', JSON.stringify(formData));
      for (let i = 0; i < this.userFiles.length; i++) {
        formDataToSubmit.append('file', this.userFiles[i]);
        this.uploadedFileNames.push(this.userFiles[i].name);
      }

      // Check if the dialog was opened for update
      if (this.isUpdate && this.patientId !== undefined) {

        // Update patient data
        this.userService.putPatient(this.patientId, formDataToSubmit).subscribe({
          next: (res) => {
            alert('Patient updated successfully!');
            this.patientForm.reset();
            this.dialogRef.close('Patient details updated.');
          },
          error: () => {
            alert('Error updating patient details.');
          }
        });
      }
      else {
        this.removeVitalsWhenNotPresent();
        // Add new patient data
        this.userService.postPatient(formDataToSubmit).subscribe({
          next: (res) => {
            alert('Patient added successfully!');
            this.patientForm.reset();
            this.dialogRef.close('Patient details saved.');
          },
          error: (err: HttpErrorResponse) => {
            const errorMessage = this.utilityService.getServerErrorMessage(err);
            alert(errorMessage); // Display error message to the user
          }
         });
      }
    } else {
      this.validateFormData(this.patientForm);
    }
  }
 
  removeVitalsWhenNotPresent() {
    const formControls = ["Weight", "Height", "Temperature", "SP", "DP"];
    let control, controlValue;

    formControls.forEach(controlName => {
      control = this.patientForm.get(controlName);
      controlValue = control?.value?.trim();
      if (controlValue === undefined || controlValue === '') {
        this.patientForm.removeControl(controlName);
      }
    });
  }


  saveFile(event: any) {
    const files: FileList = event?.target.files;

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.userFiles.push(file);
      }
    }
  }

  validateFormData(patientForm: FormGroup) {
    Object.keys(patientForm.controls).forEach(element => {
      const control = patientForm.get(element);
    });
  }

}
