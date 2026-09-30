<?php
/**
 * Render template for cas-ngs/act2-bento-grid
 *
 * @package CAS_NGS_Biotech_Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

$uid = wp_unique_id( 'cas-bento-' );

// Eyebrow and Section info
$badge_text    = isset( $attributes['badge_text'] ) && '' !== $attributes['badge_text'] ? $attributes['badge_text'] : __( 'Comprehensive Genomics Ecosystem', 'cas-ngs-biotech-blocks' );
$section_title = isset( $attributes['section_title'] ) && '' !== $attributes['section_title'] ? $attributes['section_title'] : __( 'Precision Long-Read Sequencing & Advanced Compute', 'cas-ngs-biotech-blocks' );
$section_desc  = isset( $attributes['section_desc'] ) && '' !== $attributes['section_desc'] ? $attributes['section_desc'] : __( 'Engineered for researchers and institutions requiring ultra-high molecular weight DNA resolution, direct epigenetic modifications, and GPU-accelerated basecalling pipelines.', 'cas-ngs-biotech-blocks' );

// Card 1: Sequencing
$card1_tag        = isset( $attributes['card1_tag'] ) ? $attributes['card1_tag'] : 'Oxford Nanopore Platform';
$card1_title      = isset( $attributes['card1_title'] ) ? $attributes['card1_title'] : __( 'Long-Read DNA & RNA Sequencing', 'cas-ngs-biotech-blocks' );
$card1_desc       = isset( $attributes['card1_desc'] ) ? $attributes['card1_desc'] : __( 'Direct single-molecule sequencing of ultra-long native DNA and native RNA strands. Zero PCR amplification bias, real-time base modification calling, and phased telomere-to-telomere genomic assemblies.', 'cas-ngs-biotech-blocks' );
$card1_spec_label = isset( $attributes['card1_spec_label'] ) ? $attributes['card1_spec_label'] : 'N50 > 50,000 BP TARGET';
$card1_cta_text   = isset( $attributes['card1_cta_text'] ) ? $attributes['card1_cta_text'] : __( 'Explore Sequencing →', 'cas-ngs-biotech-blocks' );
$card1_cta_url    = isset( $attributes['card1_cta_url'] ) ? $attributes['card1_cta_url'] : '/services/#sequencing';

// Card 2: Bioinformatics
$card2_tag             = isset( $attributes['card2_tag'] ) ? $attributes['card2_tag'] : 'GPU Compute Pipeline';
$card2_title           = isset( $attributes['card2_title'] ) ? $attributes['card2_title'] : __( 'Custom Bioinformatics Pipelines', 'cas-ngs-biotech-blocks' );
$card2_desc            = isset( $attributes['card2_desc'] ) ? $attributes['card2_desc'] : __( 'End-to-end computational genomics run on dedicated NVIDIA GPU clusters. From Dorado Super-Accuracy basecalling to Sniffles2 structural variant discovery, phased diploid assemblies, and methylome profiling.', 'cas-ngs-biotech-blocks' );
$card2_spec_label      = isset( $attributes['card2_spec_label'] ) ? $attributes['card2_spec_label'] : 'NVIDIA RTX 4090 CLUSTERS';
$card2_cta_text        = isset( $attributes['card2_cta_text'] ) ? $attributes['card2_cta_text'] : __( 'View Pipelines →', 'cas-ngs-biotech-blocks' );
$card2_cta_url         = isset( $attributes['card2_cta_url'] ) ? $attributes['card2_cta_url'] : '/bioinformatics/';
$card2_terminal_title  = isset( $attributes['card2_terminal_title'] ) ? $attributes['card2_terminal_title'] : 'dorado_live_gpu_pipeline.sh';
$card2_histogram_label = isset( $attributes['card2_histogram_label'] ) ? $attributes['card2_histogram_label'] : __( 'READ LENGTH DISTRIBUTION (N50: 42.8 KB)', 'cas-ngs-biotech-blocks' );

// Card 3: Capacity Building
$card3_tag        = isset( $attributes['card3_tag'] ) ? $attributes['card3_tag'] : 'Institutional Enablement • RESIDENCY PROGRAM';
$card3_title      = isset( $attributes['card3_title'] ) ? $attributes['card3_title'] : __( 'Hands-On Capacity Building & Laboratory Training', 'cas-ngs-biotech-blocks' );
$card3_desc       = isset( $attributes['card3_desc'] ) ? $attributes['card3_desc'] : __( 'Democratizing genomic knowledge by training the next generation of sequencing scientists. We partner with universities, government labs, and medical centers to stand up self-sufficient long-read genomics hubs.', 'cas-ngs-biotech-blocks' );
$card3_spec_label = isset( $attributes['card3_spec_label'] ) ? $attributes['card3_spec_label'] : 'ACADEMIC & GOVERNMENT COHORTS';
$card3_cta_text   = isset( $attributes['card3_cta_text'] ) ? $attributes['card3_cta_text'] : __( 'View Training Modules →', 'cas-ngs-biotech-blocks' );
$card3_cta_url    = isset( $attributes['card3_cta_url'] ) ? $attributes['card3_cta_url'] : '/capacity-building/';

$training_1_title = isset( $attributes['training_1_title'] ) ? $attributes['training_1_title'] : __( 'Wet Lab Masterclasses', 'cas-ngs-biotech-blocks' );
$training_1_desc  = isset( $attributes['training_1_desc'] ) ? $attributes['training_1_desc'] : __( 'HMW DNA extraction, barcoding protocols, and flowcell priming diagnostics.', 'cas-ngs-biotech-blocks' );
$training_2_title = isset( $attributes['training_2_title'] ) ? $attributes['training_2_title'] : __( 'University Lab Training', 'cas-ngs-biotech-blocks' );
$training_2_desc  = isset( $attributes['training_2_desc'] ) ? $attributes['training_2_desc'] : __( 'Turnkey MinION starter deployments and standardized wet-lab curriculum.', 'cas-ngs-biotech-blocks' );
$training_3_title = isset( $attributes['training_3_title'] ) ? $attributes['training_3_title'] : __( 'Student Internships', 'cas-ngs-biotech-blocks' );
$training_3_desc  = isset( $attributes['training_3_desc'] ) ? $attributes['training_3_desc'] : __( 'Immersive 12-week genomic data analysis residencies with certified competency.', 'cas-ngs-biotech-blocks' );
?>

<section class="cas-bio-block cas-act-2" id="<?php echo esc_attr( $uid ); ?>" aria-labelledby="<?php echo esc_attr( $uid ); ?>-title">
  <div class="cas-container">

    <div class="section-eyebrow gsap-fade-up">
      <span class="badge-pill"><?php echo esc_html( $badge_text ); ?></span>
      <h2 id="<?php echo esc_attr( $uid ); ?>-title" class="section-title"><?php echo esc_html( $section_title ); ?></h2>
      <p class="section-desc">
        <?php echo esc_html( $section_desc ); ?>
      </p>
    </div>

    <div class="bento-grid">

      <!-- CARD 1: Sequencing Technology -->
      <article class="bento-card gsap-scale-in" id="<?php echo esc_attr( $uid ); ?>-seq">
        <div class="bento-hardware-frame">
          <div class="hardware-schematic-wrap">
            <svg viewBox="0 0 600 300" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="600" height="300" fill="#180c07"/>
              <rect x="40" y="30" width="520" height="240" rx="14" fill="#241209" stroke="#865438" stroke-width="1.5"/>
              <rect x="65" y="55" width="470" height="190" rx="8" fill="#100703" stroke="#865438" stroke-width="0.8"/>
              <g opacity="0.8">
                <rect x="90" y="80" width="120" height="140" rx="6" fill="#1c0e07" stroke="#865438" stroke-width="1"/>
                <text x="150" y="155" fill="#e6ccb2" font-family="monospace" font-size="11" text-anchor="middle">FLOW CELL A1</text>
                <circle cx="150" cy="180" r="6" fill="#4ade80"/>

                <rect x="240" y="80" width="120" height="140" rx="6" fill="#1c0e07" stroke="#865438" stroke-width="1"/>
                <text x="300" y="155" fill="#e6ccb2" font-family="monospace" font-size="11" text-anchor="middle">FLOW CELL A2</text>
                <circle cx="300" cy="180" r="6" fill="#4ade80"/>

                <rect x="390" y="80" width="120" height="140" rx="6" fill="#1c0e07" stroke="#865438" stroke-width="1"/>
                <text x="450" y="155" fill="#e6ccb2" font-family="monospace" font-size="11" text-anchor="middle">FLOW CELL A3</text>
                <circle cx="450" cy="180" r="6" fill="#4ade80"/>
              </g>
            </svg>
          </div>
          <div class="hardware-gradient-overlay"></div>
        </div>

        <div class="bento-card-body">
          <div class="bento-card-tag"><?php echo esc_html( $card1_tag ); ?></div>
          <h3 class="bento-card-title"><?php echo esc_html( $card1_title ); ?></h3>
          <p class="bento-card-desc">
            <?php echo esc_html( $card1_desc ); ?>
          </p>
          <div class="tech-tags">
            <span class="tech-tag">HMW DNA Extraction</span>
            <span class="tech-tag">Direct RNA-Seq</span>
            <span class="tech-tag">5mC &amp; 6mA Methylation</span>
            <span class="tech-tag">Adaptive Sampling</span>
          </div>
          <div class="bento-card-action">
            <span class="bento-card-spec-label"><?php echo esc_html( $card1_spec_label ); ?></span>
            <a href="<?php echo esc_url( $card1_cta_url ); ?>" class="btn btn-primary btn-sm"><?php echo esc_html( $card1_cta_text ); ?></a>
          </div>
        </div>
      </article>

      <!-- CARD 2: Bioinformatics & Interactive Sequencer Terminal -->
      <article class="bento-card gsap-scale-in" id="<?php echo esc_attr( $uid ); ?>-bio">
        <div class="bento-terminal">
          <div class="terminal-bar">
            <span class="terminal-dot terminal-dot-r"></span>
            <span class="terminal-dot terminal-dot-y"></span>
            <span class="terminal-dot terminal-dot-g"></span>
            <span class="terminal-title"><?php echo esc_html( $card2_terminal_title ); ?></span>
          </div>
          <div class="terminal-lines">
            <span class="tl tl-dim"># Oxford Nanopore Super-Accuracy Dorado Basecalling</span>
            <span class="tl tl-cmd">$ dorado basecaller sup,5mCG_5hmCG pod5/ --device cuda:all</span>
            <span class="tl tl-ok">✔ Flow cell R10.4.1 loaded &bull; 2,048 pore channels online</span>
            <span class="tl tl-data">→ Real-time Q20+ filtered reads: <span class="tl-acc">98.2%</span></span>
            <span class="tl tl-data">→ Cumulative bases called: <span class="tl-hi">84.9 Gb</span></span>
            <span class="tl tl-cmd">$ sniffles --input aligned.bam --vcf structural_variants.vcf</span>
            <span class="tl tl-ok">✔ Phased SV calls resolved across all chromosomes</span>
            <span class="tl tl-data">→ Translocation events identified: 14</span>
            <span class="tl tl-cmd">$ _<span class="tl-cursor"></span></span>
          </div>
          <div class="read-dist-panel">
            <div class="read-dist-label"><?php echo esc_html( $card2_histogram_label ); ?></div>
            <div class="read-dist-bars" id="<?php echo esc_attr( $uid ); ?>-hist" data-cas-readdist="true"></div>
          </div>
        </div>

        <div class="bento-card-body">
          <div class="bento-card-tag"><?php echo esc_html( $card2_tag ); ?></div>
          <h3 class="bento-card-title"><?php echo esc_html( $card2_title ); ?></h3>
          <p class="bento-card-desc">
            <?php echo esc_html( $card2_desc ); ?>
          </p>
          <div class="tech-tags">
            <span class="tech-tag">Dorado SUP Neural Models</span>
            <span class="tech-tag">Sniffles2 SV Discovery</span>
            <span class="tech-tag">Phased Diploid Assembly</span>
            <span class="tech-tag">Full VCF / BAM / POD5</span>
          </div>
          <div class="bento-card-action">
            <span class="bento-card-spec-label"><?php echo esc_html( $card2_spec_label ); ?></span>
            <a href="<?php echo esc_url( $card2_cta_url ); ?>" class="btn btn-primary btn-sm"><?php echo esc_html( $card2_cta_text ); ?></a>
          </div>
        </div>
      </article>

      <!-- CARD 3: Capacity Building (Full Width) -->
      <article class="bento-card bento-card-full gsap-scale-in" id="<?php echo esc_attr( $uid ); ?>-cap">
        <div class="bento-lab-frame">
          <svg viewBox="0 0 1280 180" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="<?php echo esc_attr( $uid ); ?>-labBg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#1e0a04"/>
                <stop offset="40%" stop-color="#3d1e0e"/>
                <stop offset="80%" stop-color="#5a2e14"/>
                <stop offset="100%" stop-color="#865438"/>
              </linearGradient>
            </defs>
            <rect width="1280" height="180" fill="url(#<?php echo esc_attr( $uid ); ?>-labBg)"/>

            <rect x="0" y="130" width="1280" height="50" fill="#2e1408" opacity="0.8"/>
            <rect x="0" y="125" width="1280" height="8" fill="#4a2010" opacity="0.9"/>

            <rect x="110" y="60" width="8" height="70" rx="3" fill="#865438" opacity="0.85"/>
            <rect x="107" y="55" width="14" height="12" rx="2" fill="#a0663d"/>
            <rect x="112" y="130" width="4" height="18" rx="1" fill="#c4956e"/>

            <rect x="200" y="90" width="90" height="42" rx="4" fill="#4a2010" opacity="0.75"/>
            <rect x="208" y="86" width="12" height="38" rx="3" fill="#e6ccb2" opacity="0.9"/>
            <rect x="224" y="86" width="12" height="38" rx="3" fill="#d4a882" opacity="0.9"/>
            <rect x="240" y="86" width="12" height="38" rx="3" fill="#865438" opacity="0.9"/>
            <rect x="256" y="86" width="12" height="38" rx="3" fill="#e6ccb2" opacity="0.9"/>
            <rect x="272" y="86" width="12" height="38" rx="3" fill="#c4956e" opacity="0.9"/>

            <rect x="380" y="88" width="110" height="44" rx="10" fill="#1e0f07" stroke="#865438" stroke-width="1.5"/>
            <rect x="392" y="96" width="86" height="28" rx="6" fill="#0f0703" stroke="#865438" stroke-width="0.8"/>
            <circle cx="420" cy="110" r="5" fill="none" stroke="#e6ccb2" stroke-width="0.8"/><circle cx="420" cy="110" r="2" fill="#4ade80"/>
            <circle cx="437" cy="110" r="5" fill="none" stroke="#e6ccb2" stroke-width="0.8"/><circle cx="437" cy="110" r="2" fill="#865438"/>
            <circle cx="454" cy="110" r="5" fill="none" stroke="#e6ccb2" stroke-width="0.8"/><circle cx="454" cy="110" r="2" fill="#4ade80"/>
            <text x="445" y="138" fill="#865438" font-family="monospace" font-size="6" text-anchor="middle">MinION Mk1D</text>

            <rect x="550" y="55" width="120" height="80" rx="5" fill="#1a0e08" stroke="#865438" stroke-width="1"/>
            <rect x="555" y="60" width="110" height="68" rx="3" fill="#0f0703"/>
            <text x="561" y="75" fill="#4ade80" font-family="monospace" font-size="6">$ dorado live --gpu</text>
            <text x="561" y="87" fill="#e6ccb2" font-family="monospace" font-size="6">Reads: 847,293</text>
            <text x="561" y="99" fill="#a5f3c0" font-family="monospace" font-size="6">Q20+: 98.7%</text>
            <text x="561" y="111" fill="#e6ccb2" font-family="monospace" font-size="6">N50: 48.2 Kb</text>
            <rect x="560" y="140" width="130" height="6" rx="2" fill="#2e1a0e" stroke="#865438" stroke-width="0.6"/>

            <rect x="730" y="80" width="100" height="52" rx="6" fill="#1e0f07" stroke="#865438" stroke-width="1"/>
            <rect x="738" y="88" width="84" height="36" rx="4" fill="#0a0502"/>
            <line x1="755" y1="91" x2="755" y2="122" stroke="#e6ccb2" stroke-width="0.6" opacity="0.4"/>
            <line x1="770" y1="91" x2="770" y2="122" stroke="#e6ccb2" stroke-width="0.6" opacity="0.4"/>
            <line x1="785" y1="91" x2="785" y2="122" stroke="#e6ccb2" stroke-width="0.6" opacity="0.4"/>
            <line x1="800" y1="91" x2="800" y2="122" stroke="#e6ccb2" stroke-width="0.6" opacity="0.4"/>
            <rect x="750" y="95" width="8" height="3" rx="1" fill="#e6ccb2" opacity="0.8"/>
            <rect x="750" y="104" width="8" height="3" rx="1" fill="#e6ccb2" opacity="0.6"/>
            <rect x="750" y="114" width="8" height="3" rx="1" fill="#e6ccb2" opacity="0.4"/>
            <rect x="766" y="100" width="8" height="3" rx="1" fill="#4ade80" opacity="0.7"/>
            <rect x="782" y="98" width="8" height="3" rx="1" fill="#4ade80" opacity="0.7"/>
            <rect x="798" y="102" width="8" height="3" rx="1" fill="#4ade80" opacity="0.7"/>
            <text x="780" y="140" fill="#865438" font-family="monospace" font-size="6" text-anchor="middle">AGAROSE GEL QC</text>

            <rect x="900" y="75" width="60" height="55" rx="8" fill="#1e0f07" stroke="#865438" stroke-width="1"/>
            <rect x="908" y="83" width="44" height="28" rx="4" fill="#0f0703"/>
            <text x="930" y="97" fill="#4ade80" font-family="monospace" font-size="6" text-anchor="middle">287.4</text>
            <text x="930" y="106" fill="#e6ccb2" font-family="monospace" font-size="5" text-anchor="middle">ng/μL</text>
            <circle cx="930" cy="118" r="7" fill="#865438" opacity="0.7"/>
            <text x="930" y="138" fill="#865438" font-family="monospace" font-size="5.5" text-anchor="middle">QUBIT 4</text>

            <ellipse cx="1100" cy="55" rx="24" ry="28" fill="#3d1e0e" opacity="0.65"/>
            <rect x="1078" y="78" width="44" height="55" rx="6" fill="#f5ede4" opacity="0.55"/>
            <rect x="1060" y="85" width="18" height="38" rx="5" fill="#f5ede4" opacity="0.5"/>
            <rect x="1122" y="85" width="18" height="38" rx="5" fill="#f5ede4" opacity="0.5"/>
            <rect x="1088" y="50" width="24" height="10" rx="3" fill="#a0cce0" opacity="0.55"/>

            <text x="640" y="165" fill="#865438" font-family="monospace" font-size="7" text-anchor="middle" letter-spacing="1" opacity="0.85">HANDS-ON LABORATORY TRAINING — HMW DNA EXTRACTION, LIBRARY PREP & NANOPORE LOADING</text>
          </svg>
          <div class="lab-gradient-overlay"></div>
        </div>

        <div class="bento-card-body">
          <div class="bento-card-tag"><?php echo esc_html( $card3_tag ); ?></div>
          <h3 class="bento-card-title"><?php echo esc_html( $card3_title ); ?></h3>
          <p class="bento-card-desc">
            <?php echo esc_html( $card3_desc ); ?>
          </p>
          <div class="capacity-mini-grid">
            <div class="capacity-mini">
              <div class="capacity-mini-title"><?php echo esc_html( $training_1_title ); ?></div>
              <p class="capacity-mini-desc"><?php echo esc_html( $training_1_desc ); ?></p>
            </div>
            <div class="capacity-mini">
              <div class="capacity-mini-title"><?php echo esc_html( $training_2_title ); ?></div>
              <p class="capacity-mini-desc"><?php echo esc_html( $training_2_desc ); ?></p>
            </div>
            <div class="capacity-mini">
              <div class="capacity-mini-title"><?php echo esc_html( $training_3_title ); ?></div>
              <p class="capacity-mini-desc"><?php echo esc_html( $training_3_desc ); ?></p>
            </div>
          </div>
          <div class="bento-card-action">
            <span class="bento-card-spec-label"><?php echo esc_html( $card3_spec_label ); ?></span>
            <a href="<?php echo esc_url( $card3_cta_url ); ?>" class="btn btn-primary btn-sm"><?php echo esc_html( $card3_cta_text ); ?></a>
          </div>
        </div>
      </article>

    </div>
  </div>
</section>
