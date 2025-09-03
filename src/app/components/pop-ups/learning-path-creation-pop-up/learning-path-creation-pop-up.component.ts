import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { lastValueFrom } from 'rxjs';
import { AudioVoiceEnum } from '../../../enums/AudioVoice.enum';
import { LearningPathTypeEnum } from '../../../enums/LearningPathType.enum';
import { QuestionTypeEnum } from '../../../enums/QuestionType.enum';
import { LearningPath } from '../../../models/LearningPath/LearningPath';
import {
	GenerateAudioLearningPathRequest,
	GenerateFlashCardLearningPathRequest,
	GenerateLearningPathRequest,
	GenerateQuestionLearningPathRequest,
	GenerateTextLearningPathRequest,
	GenerateVideoLearningPathRequest,
} from '../../../models/LearningPath/LearningPathGeneration';
import { Syllabus } from '../../../models/Syllabus';
import { ContextService } from '../../../services/context.service';
import { LearningPathService } from '../../../services/learning-path.service';
import { LoadingComponent } from '../../loading/loading.component';
import { SyllabusComponent } from '../../syllabus/syllabus.component';
import { PopUpHeaderComponent } from '../pop-up-header/pop-up-header.component';
import { SuccessPopUpComponent, SuccessPopUpData } from '../success-pop-up/success-pop-up.component';

@Component({
	selector: 'o-learning-path-creation-pop-up',
	imports: [
		PopUpHeaderComponent,
		MatStepperModule,
		MatButtonModule,
		MatFormFieldModule,
		ReactiveFormsModule,
		SyllabusComponent,
		MatInputModule,
		MatSelectModule,
		MatSlideToggleModule,
		LoadingComponent,
	],
	templateUrl: './learning-path-creation-pop-up.component.html',
	styleUrl: './learning-path-creation-pop-up.component.scss',
})
export class LearningPathCreationPopUpComponent {
	ctx: ContextService = inject(ContextService);
	formBuilder: FormBuilder = inject(FormBuilder);
	service: LearningPathService = inject(LearningPathService);
	dialog: MatDialog = inject(MatDialog);
	dialogRef: MatDialogRef<LearningPathCreationPopUpComponent> = inject(
		MatDialogRef<LearningPathCreationPopUpComponent>,
	);

	isLoading: boolean = false;
	learningPathTypeEnum = LearningPathTypeEnum;
	questionTypeEnum = QuestionTypeEnum;
	audioVoiceEnum = AudioVoiceEnum;

	baseLastForm = {
		language: this.formBuilder.control<string>('pt-BR', Validators.required),
	};
	videoForm = {
		numberOfVideos: this.formBuilder.control<number>(5, Validators.required),
	};
	textForm = {
		numberOfParagraphs: this.formBuilder.control<number>(5, Validators.required),
		useTopics: this.formBuilder.control<boolean>(false, Validators.required),
		formality: this.formBuilder.control<string>('medium', Validators.required),
	};
	questionForm = {
		numberOfQuestions: this.formBuilder.control<number>(20, Validators.required),
		level: this.formBuilder.control<number>(0),
		questionTypes: this.formBuilder.control<string[]>(
			[
				this.questionTypeEnum.MULTIPLE_CHOICE,
				this.questionTypeEnum.MULTIPLE_SELECTION,
				this.questionTypeEnum.TRUE_FALSE,
				this.questionTypeEnum.OPEN_ENDED,
			],
			Validators.required,
		),
	};
	audioForm = {
		durationInSeconds: this.formBuilder.control<number>(90, Validators.required),
		formality: this.formBuilder.control<string>('medium', Validators.required),
		voice: this.formBuilder.control<AudioVoiceEnum>(this.audioVoiceEnum.ALLOY, Validators.required),
	};
	flashCardForm = {
		numberOfCards: this.formBuilder.control<number>(15, Validators.required),
		level: this.formBuilder.control<number>(0),
	};

	forms = this.formBuilder.array([
		this.formBuilder.group({
			syllabus: this.formBuilder.control<Syllabus[]>([], Validators.required),
		}),
		this.formBuilder.group({
			name: this.formBuilder.control<string>('', Validators.required),
			type: this.formBuilder.control<LearningPathTypeEnum>(LearningPathTypeEnum.TEXT, Validators.required),
		}),
		this.formBuilder.group({ ...this.baseLastForm, ...this.textForm }),
	]);

	getFormControl(i: number, name: string): FormControl {
		return this.forms.at(i).get(name) as FormControl;
	}

	learningPathTypeButtonClass(type: LearningPathTypeEnum): string {
		return this.getFormControl(1, 'type').value === type
			? 'selected-learning-path-type-button'
			: 'learning-path-type-button';
	}

	markSyllabus(syllabus: Syllabus[]) {
		this.getFormControl(0, 'syllabus').setValue(syllabus);
	}

	setLastFormGroup(group: any) {
		this.forms.removeAt(2);
		let completeGroupObject = Object.assign({}, this.baseLastForm, group);
		this.forms.push(this.formBuilder.group(completeGroupObject));
	}

	selectType(type: LearningPathTypeEnum) {
		switch (type) {
			case LearningPathTypeEnum.VIDEO:
				this.setLastFormGroup(this.videoForm);
				break;
			case LearningPathTypeEnum.TEXT:
				this.setLastFormGroup(this.textForm);
				break;
			case LearningPathTypeEnum.QUESTION:
				this.setLastFormGroup(this.questionForm);
				break;
			case LearningPathTypeEnum.AUDIO:
				this.setLastFormGroup(this.audioForm);
				break;
			case LearningPathTypeEnum.FLASHCARD:
				this.setLastFormGroup(this.flashCardForm);
				break;
			default:
				this.setLastFormGroup({});
				this.getFormControl(1, 'type').reset();
				return;
		}
		this.getFormControl(1, 'type').setValue(type);
	}

	async createLearningPath() {
		if (this.forms.valid) {
			this.isLoading = true;

			let endpoint: string = '';
			let syllabusIds: string[] = [];
			this.getFormControl(0, 'syllabus').value.forEach((syllabus: Syllabus) => {
				syllabusIds.push(syllabus.id!);
			});
			let name: string = this.getFormControl(1, 'name').value;
			const baseBody: any = { syllabusIds, name, language: this.getFormControl(2, 'language').value };
			let requestBody: GenerateLearningPathRequest | undefined;

			switch (this.getFormControl(1, 'type').value) {
				case LearningPathTypeEnum.VIDEO:
					endpoint = 'video';
					requestBody = {
						...baseBody,
						numberOfVideos: this.getFormControl(2, 'numberOfVideos').value,
					} as GenerateVideoLearningPathRequest;
					break;
				case LearningPathTypeEnum.TEXT:
					endpoint = 'text';
					requestBody = {
						...baseBody,
						numberOfParagraphs: this.getFormControl(2, 'numberOfParagraphs').value,
						useTopics: this.getFormControl(2, 'useTopics').value,
						formality: this.getFormControl(2, 'formality').value,
					} as GenerateTextLearningPathRequest;
					break;
				case LearningPathTypeEnum.AUDIO:
					endpoint = 'audio';
					requestBody = {
						...baseBody,
						durationInSeconds: this.getFormControl(2, 'durationInSeconds').value,
						formality: this.getFormControl(2, 'formality').value,
						voice: this.getFormControl(2, 'voice').value,
					} as GenerateAudioLearningPathRequest;
					break;
				case LearningPathTypeEnum.FLASHCARD:
					endpoint = 'flashcard';
					requestBody = {
						...baseBody,
						numberOfCards: this.getFormControl(2, 'numberOfCards').value,
						level: this.getFormControl(2, 'level').value,
					} as GenerateFlashCardLearningPathRequest;
					break;
				case LearningPathTypeEnum.QUESTION:
					endpoint = 'question';
					requestBody = {
						...baseBody,
						numberOfQuestions: this.getFormControl(2, 'numberOfQuestions').value,
						level: this.getFormControl(2, 'level').value,
						questionTypes: this.getFormControl(2, 'questionTypes').value,
					} as GenerateQuestionLearningPathRequest;
					break;
			}

			await lastValueFrom(this.service.generateLearningPath(requestBody!, endpoint))
				.then((r: LearningPath) => {
					if (r) {
						let sucessPopUpData: SuccessPopUpData = {
							title: 'Sua Rota de Aprendizagem está sendo criada!',
							message: 'Você pode conferir o progresso na página da turma.',
							buttonText: 'OK',
						};
						this.dialog
							.open(SuccessPopUpComponent, {
								data: sucessPopUpData,
							})
							.afterClosed()
							.subscribe(() => {
								this.dialogRef.close(r);
							});
					}
				})
				.finally(() => {
					this.isLoading = false;
				});
		}
	}
}
