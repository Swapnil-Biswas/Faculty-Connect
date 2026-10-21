"use client";

const domains = [
  {
    code: "SYS",
    label: "Systems & Cloud Computing",
    blurb: "Operating Systems, Distributed Architecture, High-Performance Virtualization & Networks.",
    accent: "#D02020",
    shape: "circle",
  },
  {
    code: "AIML",
    label: "Artificial Intelligence & ML",
    blurb: "Deep Learning, LLM Fine-tuning, Computer Vision, Edge AI & Neural Inference.",
    accent: "#1040C0",
    shape: "square",
  },
  {
    code: "CYBR",
    label: "Cybersecurity & Cryptography",
    blurb: "Post-quantum cryptosystems, Network Defense, Threat Intelligence & Forensics.",
    accent: "#F0C020",
    shape: "triangle",
  },
  {
    code: "DATA",
    label: "Data Engineering & Analytics",
    blurb: "High-Throughput Big Data Pipelines, Streaming architectures & OLAP Warehouses.",
    accent: "#D02020",
    shape: "square",
  },
  {
    code: "SOFT",
    label: "Software Engineering & Dev",
    blurb: "Full-Stack Web/Mobile Systems, Formal Verification, CI/CD Pipelines & DevOps.",
    accent: "#1040C0",
    shape: "triangle",
  },
  {
    code: "IOT",
    label: "Internet of Things & Embedded",
    blurb: "Microcontrollers, Sensor Telemetry, Autonomous Robotics & Hardware Security.",
    accent: "#F0C020",
    shape: "circle",
  },
];

export default function Domains() {
  return (
    <section id="domains" className="bg-[#F0F0F0] border-b-4 border-[#121212] py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-4 mb-14">
          <div className="inline-flex items-center gap-2 self-start bg-[#D02020] text-white border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] px-3.5 py-1 text-xs font-black tracking-widest uppercase">
            // 06 — ACADEMIC CLUSTERS
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#121212] leading-[1.12]">
                SIX CLUSTERS.
                <br />
                <span className="text-[#1040C0]">ONE DEPARTMENT.</span>
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-sm sm:text-base font-medium text-[#424245] leading-relaxed">
                Faculty research, teaching portfolios, and student capstones are categorized across six specialized clusters for targeted NBA criterion reviews.
              </p>
            </div>
          </div>
        </div>

        {/* 6 Cluster Geometric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {domains.map((d) => (
            <div
              key={d.code}
              id={`domain-${d.code.toLowerCase()}`}
              className="bg-white border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] p-7 sm:p-8 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200 relative min-h-[250px]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  {/* Geometric Shape Badge */}
                  <div className="flex items-center gap-2">
                    {d.shape === "circle" ? (
                      <div
                        className="w-5 h-5 rounded-full border-2 border-[#121212]"
                        style={{ backgroundColor: d.accent }}
                      />
                    ) : d.shape === "square" ? (
                      <div
                        className="w-5 h-5 border-2 border-[#121212]"
                        style={{ backgroundColor: d.accent }}
                      />
                    ) : (
                      <div
                        className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px]"
                        style={{ borderBottomColor: d.accent }}
                      />
                    )}
                    <span className="text-xs font-black uppercase tracking-widest text-[#121212]">
                      CLUSTER // {d.code}
                    </span>
                  </div>

                  <span
                    className="text-xs font-black uppercase px-2 py-0.5 border-2 border-[#121212]"
                    style={{ backgroundColor: d.accent, color: d.accent === "#F0C020" ? "#121212" : "#FFFFFF" }}
                  >
                    {d.code}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#121212] mb-3 leading-snug">
                  {d.label}
                </h3>

                <p className="text-sm font-medium text-[#424245] leading-relaxed">
                  {d.blurb}
                </p>
              </div>

              <div className="pt-5 mt-6 border-t-2 border-[#121212] flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#121212]">
                  AUTONOMOUS ELECTIVES
                </span>
                <span className="w-2.5 h-2.5 bg-[#121212]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { Domains };
