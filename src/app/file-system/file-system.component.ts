import { ElementRef, AfterViewInit } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-file-system',
  templateUrl: './file-system.component.html',
  styleUrls: ['./file-system.component.scss'],
})
export class FileSystemComponent implements OnInit, AfterViewInit {
  unsupportedText: string | undefined;
  errorText: string | undefined;

  // TIP: We could persist the fileHandle locally in an IndexedDB in order to
  // restore previously opened files or show the latest opened files.
  fileHandle: FileSystemFileHandle | undefined;

  @ViewChild('textbox')
  textarea!: ElementRef;
  textAreaElement!: HTMLTextAreaElement;

  constructor(private titleService: Title) {
    this.titleService.setTitle('File System');
  }

  ngOnInit(): void {
    // Conditions valid until Chrome 85 and from v86 respectively
    if (
      !('chooseFileSystemEntries' in window) &&
      !('showOpenFilePicker' in window)
    ) {
      this.unsupportedText =
        'Your browser does not support File System Access API or you did not activate the Chrome flag.';
    }
  }

  ngAfterViewInit(): void {
    this.textAreaElement = this.textarea.nativeElement as HTMLTextAreaElement;
  }

  /**
   * It opens an existing file, creating a fileHandle for it.
   */
  async openFile(): Promise<any> {
    try {
      // By opening a file, the user grants READ permissions at once (Chrome 86+)
      // NB. We keep the fileHandle reference for later use (eg. save directly the file)
      this.fileHandle = await this.getFileHandle();

      // Returns a standard File object representing the selected file on disk
      const openedFile = await this.fileHandle.getFile();
      this.textAreaElement.value = await openedFile.text();
    } catch (error) {
      this.errorText = (error as any).message;
      console.error(error);
    }
  }

  /**
   * The text passed as parameter is saved on the existing file, using an existing fileHandle.
   * If the fileHandle does not exist, a new file and the relative fileHandle will be created.
   * @param fileText The text content
   */
  async saveFile(fileText: string): Promise<void> {
    try {
      if (this.fileHandle) {
        await this.writeTextFile(this.fileHandle, fileText);
      } else {
        // It is a brand new file, save it to a new file
        return await this.saveAs(fileText);
      }
    } catch (error) {
      // If the user doesn't grant WRITE permission a DOMException is triggered
      this.errorText = (error as any).message;
      console.error(error);
    }
  }

  /**
   * It saves the text contento into a new file. A new fileHandle is generated.
   * @param fileText The text content
   */
  async saveAs(fileText: string): Promise<void> {
    try {
      // Save dialog grants WRITE permission
      this.fileHandle = await this.getNewFileHandle();
      await this.writeTextFile(this.fileHandle, fileText);
    } catch (error) {
      this.errorText = (error as any).message;
      console.error(error);
    }
  }

  private async writeTextFile(
    fileHandle: FileSystemFileHandle,
    textContent: string
  ): Promise<void> {
    // Creates a WRITABLE STREAM. Chrome first checks if the user has granted WRITE permission to the file
    const writeable = await fileHandle.createWritable();

    // Writes the textarea content to the stream.
    writeable.write(textContent);

    // No changes are written to the disk until we close the stream!
    writeable.close();
  }

  private async getFileHandle(): Promise<FileSystemFileHandle> {
    const options = this.getFilePickerOptions();

    // Chrome 86+
    if ('showOpenFilePicker' in window) {
      return window
        .showOpenFilePicker(options)
        .then((handles: FileSystemFileHandle[]) => handles[0]);
    }
    // Chrome 85 and previous versions
    return window.chooseFileSystemEntries(options);
  }

  private getNewFileHandle(): Promise<FileSystemFileHandle> {
    let options = {};

    // Chrome 86+
    if ('showSaveFilePicker' in window) {
      options = this.getFilePickerOptions();
      return window.showSaveFilePicker(options);
    }
    // Chrome 85 and previous versions
    options = this.getFilePickerOptions('save-file');
    return window.chooseFileSystemEntries(options);
  }

  private getFilePickerOptions(
    type: 'open-file' | 'save-file' = 'open-file'
  ): any {
    if ('showSaveFilePicker' in window) {
      return {
        types: [
          {
            description: 'Text files',
            accept: { 'text/plain': ['.txt'] },
          },
        ],
      };
    }

    return {
      type,
      accepts: [
        {
          description: 'Text files',
          mimeTypes: ['text/plain'],
          extensions: ['txt'],
        },
      ],
    };
  }
}
