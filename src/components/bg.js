export function initWebGLBackground() {
    const canvas = document.getElementById('smokey-canvas');
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    const vertexSource = `attribute vec4 a_position; void main() { gl_Position = a_position; }`;
    const fragmentSource = `precision mediump float; uniform vec2 iResolution; uniform float iTime; void main() { vec2 uv = gl_FragCoord.xy / iResolution; float t = iTime * 0.4; vec2 dist = uv; for(float i=1.0;i<8.0;i++){ dist.x += 0.3/i*cos(i*3.0*dist.y+t); dist.y += 0.3/i*cos(i*3.0*dist.x+t); } float glow = smoothstep(0.9, 0.1, abs(sin(dist.x+dist.y+t))); gl_FragColor = vec4(vec3(0.15, 0.3, 0.85)*glow, 1.0); }`;
    const program = gl.createProgram();
    const createS = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
    gl.attachShader(program, createS(gl.VERTEX_SHADER, vertexSource)); gl.attachShader(program, createS(gl.FRAGMENT_SHADER, fragmentSource)); gl.linkProgram(program); gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "a_position"); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const resL = gl.getUniformLocation(program, "iResolution"); const timeL = gl.getUniformLocation(program, "iTime");
    const render = (t) => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; gl.viewport(0,0,canvas.width,canvas.height); gl.uniform2f(resL, canvas.width, canvas.height); gl.uniform1f(timeL, t*0.001); gl.drawArrays(gl.TRIANGLES, 0, 6); requestAnimationFrame(render); }; 
    requestAnimationFrame(render);
}
