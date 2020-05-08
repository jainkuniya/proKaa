![proka](https://user-images.githubusercontent.com/14369357/80859251-c8262d80-8c7c-11ea-8cb2-1e3cef07a802.png)

<h1 align="center">ProKaa</h1>

<p align="center">
  <p align="center"> The missing GUI Client for publishing messages to <b>Kafka</b>. 🌸</p>

  <p align="center"> Inspired by <b>BloomRPC</b> </p>
  <p align="center"> <b>ProKaa</b> aim to give the simplest and efficient developer experience for testing Kafka consumers. </p>

  <p align="center"> Install the client, select your protobuf files and start pushing messages to kafka!
  No extra steps or configuration needed. </p>
</p>

## Contributing

<p>
  Prokaa is a electorn app which uses <a href="https://electron.atom.io/">Electron</a>, <a href="https://facebook.github.io/react/">React</a>, <a href="https://github.com/reactjs/redux">Redux</a>, <a href="https://github.com/reactjs/react-router">React Router</a>, <a href="https://webpack.github.io/docs/">Webpack</a> and <a href="https://github.com/gaearon/react-hot-loader">React Hot Loader</a> for rapid application development (HMR).
</p>

### Install

First, clone the repo via git and install dependencies:

```bash
git clone https://github.com/jainkuniya/proKaa
cd proKaa
yarn
```

### Starting Development

Start the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a webpack dev server that sends hot updates to the renderer process:

```bash
yarn dev
```

![prokaa-example](https://user-images.githubusercontent.com/18511177/80861361-bbf59c80-8c8b-11ea-8999-9fe1093228cf.png)

### Packaging

To package Prokaa for the local platform:

```bash
yarn package
```

## License

[Apache License 2.0](https://github.com/jainkuniya/proKaa/)
