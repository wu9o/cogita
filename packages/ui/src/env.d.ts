// Tell TypeScript how to handle CSS Modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
