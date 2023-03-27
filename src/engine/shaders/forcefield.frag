#version 300 es

precision highp float;

uniform float iTime;
uniform float seed;
uniform float remainingHP;

in vec2 vTextureCoord;

out vec4 fragColor;

float hash(vec3 p)
{
    p = fract(p * 0.3183099 + .1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x)
{
    x += seed;
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i + vec3(0, 0, 0)),
    hash(i + vec3(1, 0, 0)), f.x),
    mix(hash(i + vec3(0, 1, 0)),
    hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)),
    hash(i + vec3(1, 0, 1)), f.x),
    mix(hash(i + vec3(0, 1, 1)),
    hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
// noise function: https://www.shadertoy.com/view/4sfGzS

float constrain_scaled_distance(float dist, float scale, float max_len, float displacement) {
    float scaled_dist = dist * scale;
    float constrained_scaled_dist = smoothstep(0.8 * max_len, max_len, scaled_dist);
    return max(0., min(scaled_dist + displacement, max_len));
}

const float PI = 3.14;

void main()
{
    vec2 normalizedCoord = (vTextureCoord.xy - 0.5) * 2.0;
    float angle = atan(normalizedCoord.x, normalizedCoord.y);
    float normalizedAngle = (angle / PI);
    float distFromCenter = length(normalizedCoord);

    float noize1 = noise(vec3(normalizedAngle * 40. + 0.5 + 1.1*iTime, distFromCenter * 10. - iTime * 1.2, normalizedCoord.x + normalizedCoord.y + iTime *0.1));

    float distFromCenterWithNoize = distFromCenter+ noize1*0.05;


    float rings = fract(clamp(distFromCenterWithNoize *2., 1., 2.))*1.2;
    rings *= rings * rings * rings;

    float noize2 = 0.7*noise(vec3(normalizedAngle * 400. + 0.5, distFromCenterWithNoize * 8. - iTime * 1., normalizedCoord.x + normalizedCoord.y + iTime *0.1));

    float ringToCenterBrightness = distFromCenter > 1.0 ? 0. : distFromCenter * distFromCenter * 0.2;
    float finalBrightness = rings*(min(noize1+0.1, 1.)) + (noize1+noize2)*rings + ringToCenterBrightness;

    // color mapping
    fragColor = vec4(pow(max(finalBrightness, 0.), 3.) * 0.35, pow(max(finalBrightness, 0.), 2.) * 0.7, finalBrightness, 1.0);
    fragColor.a = finalBrightness;


    float opacity = 1. * remainingHP;
    fragColor *= opacity;
    fragColor.a *= opacity;
}
