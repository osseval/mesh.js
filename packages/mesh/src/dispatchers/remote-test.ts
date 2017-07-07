import { expect } from "chai";
import { timeout } from "../test";
import { EventEmitter } from "events";
import { createRemoteDispatcher, readAll, pipe, through } from "../";

describe(__filename + "#", () => {

  const createOptions = ({ timeout = 100 }: { timeout?: number } = {}, input?: EventEmitter, output?: EventEmitter) => {
    if (!input || !output) {
      input = output = new EventEmitter();
    }
    return {
      timeout: timeout,
      adapter: {
        addListener : input.on.bind(input, "message"),
        send        : input.emit.bind(input, "message")
      }
    }
  }

  interface TestMessage {
    text: string;
  }

  it("can send and receive a remote message", async () => {

    const options = createOptions();

    const adispatch = createRemoteDispatcher<TestMessage>(options, (({ text }) => {
      return text.toUpperCase();
    }));

    const bdispatch = createRemoteDispatcher<TestMessage>(options);

    expect(await readAll(bdispatch({ text: "hello" }))).to.eql(["HELLO"]);
  });

  it("can send and receive a remote stream", async () => {

    const options = createOptions();

    const adispatch = createRemoteDispatcher(options, function*({ text }) {
      for (const char of text.split("")) {
        yield char;
      }
    });

    const bdispatch = createRemoteDispatcher(options);

    expect(await readAll(bdispatch({ text: "hello" }))).to.eql(["h", "e", "l", "l", "o"]);
  });

  it("can write chunks to a remote stream", async () => {
    const options = createOptions();

    const adispatch = createRemoteDispatcher(options, () => through((char: string) => char.toUpperCase()));

    const bdispatch = createRemoteDispatcher(options);

    expect(await readAll(pipe(["a", "b", "c", "d"], bdispatch({})))).to.eql(["A", "B", "C", "D"]);

  });

  // xit("can abort a remote stream", async () => {
  //   const options = createOptions();
  //   const adispatch = createRemoteDispatcher(options, () => through((char: string) => char.toUpperCase()));

  //   const bdispatch = createRemoteDispatcher(options);

  //   const { writable, readable } = bbus.dispatch({});
  //   const writer = writable.getWriter();
  //   const reader = readable.getReader();
  //   writer.write("a").catch(e => {});
  //   writer.write("b").catch(e => {});
  //   writer.write("c").catch(e => {});
  //   await writer.abort(new Error("Cannot write anymore"));

  //   let error;

  //   try {
  //     await reader.read();
  //   } catch(e) {
  //     error = e;
  //   }

  //   expect(error.message).to.equal("Writable side aborted");
  // });

  // it("can cancel a read stream", async () => {

  //   const abus = new RemoteBus(createOptions(), ({ text } => {
  //     return new TransformStream({
  //       start(controller) {
  //         text.split("").forEach(chunk => controller.enqueue(chunk.toUpperCase()));
  //       }
  //     })
  //   }));
  //   const bbus = new RemoteBus(abus);

  //   const { writable, readable } = bbus.dispatch({ text: "abcde" });
  //   const reader = readable.getReader();
  //   expect((await reader.read()).value).to.equal("A");
  //   expect((await reader.read()).value).to.equal("B");
  //   expect((await reader.read()).value).to.equal("C");
  //   reader.cancel("not interested");
  //   expect((await reader.read()).done).to.equal(true);
  // });


  it("doesn\'t get re-dispatched against the same remote dispatcher", async () => {
    let i = 0;
    const options = createOptions();
    const adispatch = createRemoteDispatcher(options, (message: string) => {
      i++;
      return adispatch(message);
    });

    const bdispatch = createRemoteDispatcher(options);
    const iter = await bdispatch({});
    await iter.next();
    await iter.next();
    await iter.next();
    expect(i).to.equal(1);
  });

  it("gets re-dispatched against other remote dispatchers", async () => {
    let i = 0;
    const optionsA = createOptions();
    const adispatch = createRemoteDispatcher(optionsA, (message: string) => {
      i++;
      return ddispatch(message);
    });

    const bdispatch = createRemoteDispatcher(optionsA);

    const optionsB = createOptions();

    createRemoteDispatcher(optionsB, (message: string) => {
      i++;
      return adispatch(message);
    });

    const ddispatch = createRemoteDispatcher(optionsB);
    const iter = bdispatch({});
    await iter.next();

    expect(i).to.equal(2);
  });

  it("ends a dispatch that takes too long to respond", async () => {
    const options = createOptions({ timeout: 5 });
    type TestMessage = {
      timeout?: number
    };

    const adispatch = createRemoteDispatcher<TestMessage>(options, (message: TestMessage) => {
      return "a";
    });

    
    const bdispatch = createRemoteDispatcher<TestMessage>(options, (message: TestMessage) => {
      return "b";
    });

    const cdispatch = createRemoteDispatcher<TestMessage>(options, (message: TestMessage) => {
      // if (message.timeout) {
        // await timeout(message.timeout);
      // }
      return "c";
    });

    expect(await readAll(adispatch({ timeout: 0 }))).to.eql(["b", "c"]);
    
  });
});