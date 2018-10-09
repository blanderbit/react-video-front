import {observable, action} from 'mobx';
import {php} from '.';
import Resumable from 'resumablejs';
import {sessionStore as session, vlogEditorStore as editor} from '../';

export class TemplatesStore {

  @observable templates = []
  @observable activeTemplate = null
  @observable uploading = []
  @observable media = []

  createResumable = i => {
    const resumable = new Resumable({
      target: 'https://intranet.sonicvoyage.nl/fileuploader/web/resumableuploader.php',
      query: {
        SessionID: session.sessionId,
        action: 'uploadvideo',
        project_id: editor.projectId
      }
    });

    resumable.assignBrowse(document.getElementById(`fieldTarget-${i}`));

    resumable.on('fileAdded', () => {
      this.uploading[i] = 0;
      resumable.upload();
    });

    resumable.on('fileSuccess', (resumableFile, response) => {
      this.addVideo(resumableFile.file, response, i);
      this.uploading[i] = null;
      resumable.cancel();
    });

    resumable.on('progress', () => {
      if (resumable.progress() !== 0) {
        this.uploading[i] = resumable.progress() * 100;
      }
    });
  }

  addVideo = (localFile, response, i) => this.media[i] = {
    ...JSON.parse(response),
    mediatype: 'video',
    localFileObj: localFile,
    src: URL.createObjectURL(localFile)
  };

  initResumables = () => {
    this.activeTemplate.fields = this.activeTemplate.fields.map((field, i) => ({...field, resumable: this.createResumable(i)}));
  }

  setTemplate = index => {
    this.activeTemplate = this.templates[index];
    this.uploading = Array(this.activeTemplate.fields.length).fill(null);
    this.media = Array(this.activeTemplate.fields.length).fill(null);
  }

  loadTemplates = () =>
    php.post('handleproject.php', {
      react: true,
      action: 'loadtemplates',
      project_id: editor.initBlankVlog().then(() => editor.projectId),
      debug: true
    }).then(res => {
      this.templates = res.templates;
    });

  next = () => {
    editor.media = this.media;
  }
}

export default TemplatesStore;
