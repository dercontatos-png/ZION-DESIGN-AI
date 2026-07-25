const buf = Buffer.from("hello world");
const blob = new Blob([buf]);
blob.arrayBuffer().then(ab => {
  console.log("ab length:", ab.byteLength);
  console.log("buffer length:", buf.length);
});
