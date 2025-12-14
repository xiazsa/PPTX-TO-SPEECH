import promptAction from '@ohos.promptAction';
import { embedNotesIntoPptx, SlideNotePayload } from '../common/pptNotes';

@Entry
@Component
struct Index {
  @State pptxPath: string = '';
  @State outputPath: string = '';
  @State locale: string = 'zh';
  @State rawNotes: string = '';
  @State status: string = '';
  @State isProcessing: boolean = false;

  private async generateNotes() {
    if (!this.pptxPath || !this.outputPath) {
      promptAction.showToast({ message: '请填写 PPTX 路径与输出路径' });
      return;
    }

    const blocks = this.rawNotes.split(/\n\n+/).map(item => item.trim()).filter(Boolean);
    const payloads: SlideNotePayload[] = blocks.map(text => ({ notes: text }));

    this.isProcessing = true;
    this.status = '正在写入备注...';
    try {
      await embedNotesIntoPptx(this.pptxPath, this.outputPath, payloads, this.locale);
      this.status = `已生成：${this.outputPath}`;
      promptAction.showToast({ message: '备注写入完成' });
    } catch (err) {
      console.error('Failed to embed notes', err);
      this.status = '写入失败，请检查文件路径与格式';
      promptAction.showToast({ message: '写入失败' });
    } finally {
      this.isProcessing = false;
    }
  }

  build() {
    Column({ space: 16 }) {
      Text('PPTX 讲稿助手（HarmonyOS）').fontSize(26).fontWeight(FontWeight.Bold);
      Text('根据输入的讲稿批量写入 PPT 每页备注区。').fontSize(16);

      Text('PPTX 文件路径').fontSize(14);
      TextInput({ placeholder: '/data/storage/el2/base/ppt/input.pptx', text: this.pptxPath })
        .onChange(value => this.pptxPath = value)
        .width('100%');

      Text('输出文件路径').fontSize(14);
      TextInput({ placeholder: '/data/storage/el2/base/ppt/output.pptx', text: this.outputPath })
        .onChange(value => this.outputPath = value)
        .width('100%');

      Text('语言（用于备注语言标签）').fontSize(14);
      TextInput({ placeholder: 'zh / en / es / fr / de / ja / ko', text: this.locale })
        .onChange(value => this.locale = value)
        .width('100%');

      Text('讲稿（双换行分隔每一页）').fontSize(14);
      TextArea({ placeholder: '每页一段文字，使用空行分隔', text: this.rawNotes })
        .onChange(value => this.rawNotes = value)
        .height(280)
        .width('100%');

      Button(this.isProcessing ? '写入中...' : '写入备注')
        .type(ButtonType.Capsule)
        .width('100%')
        .enabled(!this.isProcessing)
        .onClick(() => this.generateNotes());

      if (this.status) {
        Text(this.status).fontSize(14).fontColor('#4C6EF5');
      }
    }
    .padding(24)
    .alignItems(HorizontalAlign.Start)
    .justifyContent(FlexAlign.Start);
  }
}
