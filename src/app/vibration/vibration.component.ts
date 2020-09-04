import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as jsonData from './solutions.json';

@Component({
  selector: 'app-vibration',
  templateUrl: './vibration.component.html',
  styleUrls: ['./vibration.component.scss']
})
export class VibrationComponent implements OnInit {
  correctAnswerPattern = [100, 30, 100, 30, 100];
  wrongAnswerPattern = [700];

  firstFormGroup: FormGroup | undefined;
  secondFormGroup: FormGroup | undefined;

  finalScore = 0;

  solutions: string[] = (jsonData as any).default.answers;
  answers: boolean[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.firstFormGroup = this.fb.group({
      question: ['', Validators.required]
    });
    this.secondFormGroup = this.fb.group({
      question: ['', Validators.required]
    });
  }

  verify(targetForm: FormGroup, questionIndex: number): void {
    const isCorrectAnswer =
      targetForm.get('question')?.value === this.solutions[questionIndex];
    let vibrationPattern = this.wrongAnswerPattern;
    if (isCorrectAnswer) {
      this.finalScore = ++this.finalScore;
      vibrationPattern = this.correctAnswerPattern;
    }
    window.navigator.vibrate(vibrationPattern);
    this.answers[questionIndex] = isCorrectAnswer;
    targetForm.disable();
  }
}