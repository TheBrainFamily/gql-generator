import { AddressInfo } from "net";
import { createApp } from "./createApp";

const opts = {
  port: process.env.PORT || 4002,
};

const getUrl = (address, port) =>
  `://${address === "::" ? "localhost" : address}:${port}`;

createApp()
  .then(({ app }) => {
    const server = app.listen(opts.port);
    const { port, address } = server.address() as AddressInfo;
    process.once("SIGTERM", function () {
      server.close(function () {
        process.kill(process.pid, "SIGTERM");
      });
    });
    console.log(`Server listening on ${getUrl(address, port)}`);
    console.log(`GraphQL playground at http://${getUrl(address, port)}/graphql`);
  })
  .catch((e) => {
    console.log("Server did not start up with this error", e);
  });
