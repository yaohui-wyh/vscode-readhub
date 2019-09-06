## 一、关于插件

在 VSCode 中快捷查阅科技动态、开发者资讯等 [Readhub](https://readhub.cn) 内容，有效利用日常工作碎片时间，功能包含：

- 展示 Readhub 各板块资讯及摘要信息
- 支持 PC 本地浏览器访问资讯内容源站
- 支持快速预览资讯全文

> 如对 JetBrains IDE（如 IntelliJ IDEA） 中使用 ReadHub 插件感兴趣，请访问 [ReadHub IntelliJ Plugin](https://github.com/alex-yh99/Readhub)

![Screenshot](https://raw.githubusercontent.com/alex-yh99/vscode-readhub/master/docs/demo.gif)

## 二、VSCode 体验

随着 VSCode 生态的日益繁荣，作为 IntelliJ 粉终于坐不住了，以围观的姿态开始试用，慢慢到如今高呼真香。花了周末学习写了下插件，稍微记录一下开发过程。

最初作为文本编辑器写 Markdown，慢慢熟悉几个快捷键之后，开始用来做开发工具。用作开发的历程比预想顺利，记忆了一个类似 IntelliJ 的 Search Everywhere 的快捷键，并装上 VIM 插件感觉就够了。如果用户是个沉迷打磨工具的 Power User，插件市场有大把的玩具还可以拿来折腾。

VSCode 作为开发工具上，由于入职新厂时的全栈化转型，开始学写 React / Redux，这个过程切实体会到了 VSCode 的便利，各种示例项目 Git 签出之后 `npm i && code .`，就能直接看代码了。初学者之路，往往只是想看 API 用法示例，又不希望在 GitHub 页面上走读代码文本，VSCode 此时的轻量优势就体现出来了：打开项目不需要复杂的工程导入配置，基本够用的 Code IntelliSense，且首次加载的建索引过程很快。

<img src="https://raw.githubusercontent.com/alex-yh99/vscode-readhub/master/docs/nyan.png" width=320>

IntelliJ 的索引耗时，Java 程序员苦之久矣，社区有个 [Nyan Progress bar](https://plugins.jetbrains.com/plugin/8575-nyan-progress-bar) 的插件，就是把进度条换成一只喵，为瞪眼等着索引建完的程序员减减压。因此 VSCode 的轻量特性，非常利于学习 + 试错的低代码场景，即随意打开 / 关闭多个项目，频繁地在项目间切换焦点（当然 IntelliJ 也有 Power-Save 模式，调 VM 参数也能做到类似的秒速启动，但还是要承认两者的竞争优势不同）

## 三、插件开发

动手写插件，主要是出于进一步了解 VSCode 扩展性和 API Framework 的考虑。选择资讯阅读插件场景，一方面场景比较经典，不论 Android、WebUI 框架的学习示例项目中，除了写 Hello World、ToDo List，就是写一个 ListView 了。另一方面比较喜欢无码科技出品的 [ReadHub](https://readhub.cn)，之前也在 IntelliJ 上做了一个 [ReadHub 插件](https://github.com/alex-yh99/Readhub)，这次迁移到 VSCode 很多接口调用等等逻辑也就直接从 Kotlin 硬翻译到 TypeScript 了。

插件技术体系涉及到插件生命周期管理、UI 定制、网络请求、配置持久化等等，基本参考几篇官方文档和示例项目，就能写出大概了，代码详见 [vscode-readhub](https://github.com/alex-yh99/vscode-readhub)

- 项目脚手架 <https://code.visualstudio.com/api/get-started/your-first-extension>
- VSCode UI 组件介绍及扩展点 <https://code.visualstudio.com/api/extension-capabilities/extending-workbench>
- TreeView 详细介绍，包括事件注册、数据绑定 <https://code.visualstudio.com/api/extension-guides/tree-view>
- Command 定义 <https://code.visualstudio.com/api/extension-guides/command>
- Configuration API <https://code.visualstudio.com/api/references/contribution-points#contributes.configuration>
- 测试 <https://code.visualstudio.com/api/working-with-extensions/testing-extension>

## 四、开发备忘

### 1. 语言方面

TypeScript 现学现用，不过由于 Google / SO 上问题和解答都很多，基本没有太多阻塞的问题；一些零散的点记录：

1. TypeScript 枚举类，如何添加方法以及自定义构造函数？似乎只能定义一个类，然后用静态成员变量代替枚举类型

    ```typescript
    // Invalid
    enum Category {
        TOPIC('topic'), NEWS('news')
        constructor(nameKey: string) {
        }
    }

    // Workaround
    class Category {
        public static TOPIC = new Category("topic");
        public static NEWS = new Category("news");
        constructor(public nameKey: string = "") { }
    }
    ```

2. StrickNullChecks 可以让 IDE 更好做空检查，不过没有类似 Kotlin 的 Safe calls (`?.`)，代码出现了不少强制非空断言 (`!.`)，比如 `a?.b?.c` 如果不想啰嗦 `a && a.b && a.b.c || undefined` 只好冒险写 `a!.b!.c`. 在 JSON 反序列化中和写测试用例时碰到。这里有个 [Proposal](https://github.com/tc39/proposal-optional-chaining)，目前在 Stage3
3. 联合类型（Union Types）`private myDate: Date | undefined` 在 Nullable 变量的类型声明比较方便
4. TypeScript 类型断言只是编译时的，没有运行时类型检查；所以 Type casting 之后访问对象属性时，还要检查一下

### 2. 框架感受

1. VSCode 的 UI 扩展能力实在是太有限，或者说太克制了。比如一个 TreeView，无法定制 Renderer，这导致基本上所有插件使用 TreeView 做出来的视图都差不多一个样
2. WebView 很便利，至少比使用 JavaFX WebView 和 Swing 组件交互简单很多；复杂插件交互可以考虑用 WebView 实现
3. 涉及并发或重度计算的场景，可能需要剥离出插件逻辑来实现了；目前看到 VSC Extension 主要关注的是 UI 和 Language 层面的扩展，复杂的任务集成型场景可能受限于框架能力

## 五、Azure DevOps 尝试

试了一下 Azure Pipelines 做 CI，体验也是很顺畅，Azure 注册直接用 GitHub Account，创建 Organization 并导入 GitHub 工程。如果包含了 `.azure-pipelines.yml` 可以智能识别模板，并且有 YAML Live Editor 直接编辑及触发 Job. 

<img src="https://raw.githubusercontent.com/alex-yh99/vscode-readhub/master/docs/pipeline.png" width=600>

CI 效率不错，Azure DevOps 的页面设计个人还是比较喜欢的，视觉链路非常清晰，不像很多面向开发者的产品把一堆有的没的都展示出来。

<img src="https://raw.githubusercontent.com/alex-yh99/vscode-readhub/master/docs/ci.png" width=600>

## 六、题外

有 Azure DevOps + GitHub 的加持，VSCode Online 似乎有着一统未来云端编程界面的趋势。目前看起来能打的只有 JetBrains + Google 的组合了，什么时候 JetBrains 能丢弃 TeamCity、Upsource 等明显掉队且追赶无望的 PaaS 业务，把 IntelliJ Platform 搬到到云端，同时和 GCP 深度合作、把整个 JVM 生态的开发工具链云化，估计才能有跟微软一较高下的可能吧。

JetBrains 起家于2000年左右给 JBuilder 做插件，彼时叫 IntelliJ Renamer，那时候「重构」_Refactor_ 一词刚被 Martin Fowler 提出没多久，还算是个 Buzzword，跟今天程序员言必称 FaaS、Serverless 化一样。JBuilder 是 Borland 搞的 Java IDE，今天的高龄程序员们在校用的 Turbo C++ 同是这家公司出品的。

之后风云变幻，Borland 掉队，传奇人物 Anders Hejlsberg 转投微软主导了 C# 和今天的 TypeScript（P.S. 推荐图书[《Borland 传奇》](https://book.douban.com/subject/1106304/)）；整个历史进程 JetBrains 是亲历者，而今天有点历史重演的感觉。