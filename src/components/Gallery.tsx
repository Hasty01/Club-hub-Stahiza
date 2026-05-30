import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { 
  Image as ImageIcon, 
  Search, 
  Heart, 
  MessageCircle, 
  Camera, 
  Calendar, 
  MapPin, 
  Share2, 
  Download, 
  Plus, 
  X, 
  ChevronRight, 
  Maximize2, 
  TrendingUp, 
  Cpu, 
  CheckCircle,
  Clock,
  Send,
  UserCheck,
  Trash2
} from "lucide-react";

interface Comment {
  id: string;
  author: string;
  avatarUrl: string;
  text: string;
  date: string;
}

interface GalleryImage {
  id: string;
  title: string;
  category: "lab" | "contest" | "members" | "trips" | "hardware";
  url: string;
  description: string;
  date: string;
  location: string;
  likes: number;
  comments: Comment[];
  photographer: string;
  photographerTitle: string;
  camera: string;
  lens: string;
  iso: number;
  aperture: string;
  shutter: string;
  hasLiked?: boolean;
}

interface GalleryProps {
  userProfile: any;
  onGrantXp: (amount: number, reason: string) => void;
}

const INITIAL_IMAGES: GalleryImage[] = [
  {
    id: "gal-1",
    title: "Primary ICT Lab Node Setup",
    category: "lab",
    url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80",
    description: "The primary computer studies practical suite configured with high speed Ethernet cabling and local dynamic simulation compilers.",
    date: "May 12, 2026",
    location: "Block B, Room 4",
    likes: 42,
    photographer: "Atamba Joel",
    photographerTitle: "Main Club Administrator",
    camera: "Sony Alpha a7 IV",
    lens: "FE 24-70mm f/2.8 GM",
    iso: 400,
    aperture: "f/4.0",
    shutter: "1/125s",
    comments: [
      { id: "c-1", author: "Mwesigwa Isaac", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Isaac", text: "Look at the neat desk organization! Ready for practical revision.", date: "May 12, 2026" },
      { id: "c-2", author: "Nsubuga Derrick", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Derrick", text: "Is the server rack finally booted?", date: "May 13, 2026" }
    ]
  },
  {
    id: "gal-2",
    title: "Joint Coding Hackathon Teams",
    category: "contest",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    description: "STAHIZZA software cadets collaboratively compiling algorithms on customized relational database tables to solve regional past UNEB items.",
    date: "May 18, 2026",
    location: "Main Science Laboratory Hall",
    likes: 38,
    photographer: "Nalubega Shadia",
    photographerTitle: "Club Registrar",
    camera: "Canon EOS R6 Mark II",
    lens: "RF 85mm f/2.0 IS STM",
    iso: 800,
    aperture: "f/2.8",
    shutter: "1/160s",
    comments: [
      { id: "c-3", author: "Atamba Joel", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Joel", text: "Unbelievable concentration in this room. Webmasters won first place!", date: "May 18, 2026" }
    ]
  },
  {
    id: "gal-3",
    title: "Debugging Complex Logic Loops",
    category: "lab",
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    description: "A close-up snapshot of a senior fellow compiling custom responsive landing page CSS models inside Standard High School's terminal.",
    date: "May 20, 2026",
    location: "STAHIZZA Terminal Suite",
    likes: 29,
    photographer: "Kato Ivan",
    photographerTitle: "Hardware Lead",
    camera: "Fujifilm X-T5",
    lens: "XF 35mm f/1.4 R",
    iso: 320,
    aperture: "f/2.0",
    shutter: "1/200s",
    comments: []
  },
  {
    id: "gal-4",
    title: "Dynamic LAN Practical Crimping",
    category: "hardware",
    url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    description: "Junior scholars inspecting and crimping high performance RJ45 connector adapters directly onto standard Cat6 double-shielded twisted-pair cables during hardware laboratory drills.",
    date: "May 25, 2026",
    location: "Networks Practical Block",
    likes: 54,
    photographer: "Musinguzi Arthur",
    photographerTitle: "Networks Overseer",
    camera: "Sony Alpha a6400",
    lens: "E 18-135mm f/3.5-5.6",
    iso: 160,
    aperture: "f/5.6",
    shutter: "1/60s",
    comments: [
      { id: "c-4", author: "Akampurira Joan", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Joan", text: "Best session of the semester. T-568B configuration completed perfectly!", date: "May 25, 2026" }
    ]
  },
  {
    id: "gal-5",
    title: "Exemplary System Software Seminars",
    category: "members",
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    description: "Our dedicated ICT club leaders coordinating an interactive whiteboard presentation detailing client-server mechanics and multi-tier databases.",
    date: "May 23, 2026",
    location: "Club Executive Room",
    likes: 31,
    photographer: "Atamba Joel",
    photographerTitle: "Main Club Administrator",
    camera: "Sony Alpha a7 IV",
    lens: "FE 24-70mm f/2.8 GM",
    iso: 500,
    aperture: "f/3.5",
    shutter: "1/100s",
    comments: []
  },
  {
    id: "gal-6",
    title: "Inter-School Computing Olympiad Team",
    category: "trips",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    description: "The official STAHIZZA squad representing the school with distinction at the Science and Technology Exhibition seminar, demonstrating responsive databases and interactive learning widgets.",
    date: "April 15, 2026",
    location: "National Science Conference Center",
    likes: 67,
    photographer: "Mrs. Nabankema Beatrice",
    photographerTitle: "Club Patron / Faculty",
    camera: "Nikon D7500",
    lens: "AF-S DX 18-140mm f/3.5-5.6G",
    iso: 1250,
    aperture: "f/4.5",
    shutter: "1/80s",
    comments: [
      { id: "c-5", author: "Atamba Joel", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Joel", text: "So proud representing Standard High School on the national podium!", date: "April 15, 2026" },
      { id: "c-6", author: "Lwanga Patrick", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Patrick", text: "Look at the massive trophy! Truly Stahizza Legends.", date: "April 16, 2026" }
    ]
  },
  {
    id: "gal-7",
    title: "Analyzing Microprocessor Circuit Architecture",
    category: "hardware",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    description: "A focused macroeconomic lens shot inspecting logic gates, RAM micro-modules, and dynamic CPU thermal compounds on a legacy system motherboard used for classroom instruction.",
    date: "May 09, 2026",
    location: "Hardware Maintenance Nodule",
    likes: 22,
    photographer: "Kato Ivan",
    photographerTitle: "Hardware Lead",
    camera: "Fujifilm X-T5",
    lens: "XF 80mm f/2.8 Macro R",
    iso: 200,
    aperture: "f/5.6",
    shutter: "1/125s",
    comments: []
  },
  {
    id: "gal-8",
    title: "Syllabus Theory Study Group",
    category: "members",
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    description: "ICT scholars conducting peer reviews of advanced flow charts, dry-running binary search algorithms on a visual slate.",
    date: "May 10, 2026",
    location: "Library Study Carrels",
    likes: 19,
    photographer: "Nalubega Shadia",
    photographerTitle: "Club Registrar",
    camera: "Canon EOS R6 Mark II",
    lens: "RF 50mm f/1.8 STM",
    iso: 640,
    aperture: "f/2.0",
    shutter: "1/200s",
    comments: []
  },
  {
    id: "gal-9",
    title: "Compiling HTML Web Sandboxes",
    category: "lab",
    url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    description: "Interactive browser design sessions inspecting flexbox structures and responsive menus to align with regional digital directives.",
    date: "May 27, 2026",
    location: "Terminal Sandbox 01",
    likes: 45,
    photographer: "Atamba Joel",
    photographerTitle: "Main Club Administrator",
    camera: "Sony Alpha a7 IV",
    lens: "FE 24-70mm f/2.8 GM",
    iso: 320,
    aperture: "f/2.8",
    shutter: "1/160s",
    comments: []
  },
  {
    id: "gal-10",
    title: "Senior Workstation Assembly Drill",
    category: "hardware",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    description: "Complete overhaul assembly of a workstation, demonstrating proper ground wrist straps, thermal grease application, and precise SATA cable configurations.",
    date: "May 14, 2026",
    location: "Assembly & Repairs Lab",
    likes: 37,
    photographer: "Kato Ivan",
    photographerTitle: "Hardware Lead",
    camera: "Fujifilm X-T5",
    lens: "XF 18-55mm f/2.8-4 R",
    iso: 800,
    aperture: "f/4.0",
    shutter: "1/90s",
    comments: []
  },
  {
    id: "gal-11",
    title: "School Database Infrastructure Project",
    category: "contest",
    url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    description: "The STAHIZZA student developers hacking an offline attendance tracker schema with complex validation queries in sqlite3 and raw SQL syntax.",
    date: "May 21, 2026",
    location: "ICT Nodule Office",
    likes: 51,
    photographer: "Musinguzi Arthur",
    photographerTitle: "Networks Overseer",
    camera: "Sony Alpha a6400",
    lens: "E 16-50mm f/3.5-5.6",
    iso: 1600,
    aperture: "f/3.5",
    shutter: "1/80s",
    comments: []
  },
  {
    id: "gal-12",
    title: "Configuring the Main Local Club Servers",
    category: "hardware",
    url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    description: "Inspecting indicator LEDs, UPS battery levels, and static IP configuration routes on the local club hub router inside the central rack panel.",
    date: "April 29, 2026",
    location: "Central Server Room",
    likes: 58,
    photographer: "Atamba Joel",
    photographerTitle: "Main Club Administrator",
    camera: "Sony Alpha a7 IV",
    lens: "FE 24-70mm f/2.8 GM",
    iso: 640,
    aperture: "f/4.0",
    shutter: "1/100s",
    comments: [
      { id: "c-7", author: "Kato Ivan", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Ivan", text: "Static routes looking incredibly synchronous!", date: "April 29, 2026" }
    ]
  },
  {
    id: "gal-13",
    title: "UI Elements Prototyping Workshop",
    category: "lab",
    url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
    description: "Scholars creating layouts and testing CSS grid alignments using raw browser console inspection monitors.",
    date: "May 08, 2026",
    location: "Primary Suite, Terminal 14",
    likes: 33,
    photographer: "Nalubega Shadia",
    photographerTitle: "Club Registrar",
    camera: "Canon EOS R6 Mark II",
    lens: "RF 35mm f/1.8 Macro IS STM",
    iso: 400,
    aperture: "f/2.0",
    shutter: "1/125s",
    comments: []
  },
  {
    id: "gal-14",
    title: "Computer Networks Demonstration Unit",
    category: "hardware",
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    description: "Hands-on instruction demonstrating fiber optics versus standard twisted-pair transmission speeds and core packet collision domains.",
    date: "May 02, 2026",
    location: "Block C Hallway Suite",
    likes: 27,
    photographer: "Mrs. Nabankema Beatrice",
    photographerTitle: "Club Patron / Faculty",
    camera: "Nikon D7500",
    lens: "AF-S DX 18-140mm f/3.5-5.6G",
    iso: 1000,
    aperture: "f/5.0",
    shutter: "1/60s",
    comments: []
  },
  {
    id: "gal-15",
    title: "Dynamic Flowcharting on Blackboard",
    category: "members",
    url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80",
    description: "Scholars sketching structured flowchart shapes (decision, execution, termination) to draft binary validation algorithms before starting standard IDE compilation.",
    date: "May 05, 2026",
    location: "Revision Lecture Room 2",
    likes: 18,
    photographer: "Atamba Joel",
    photographerTitle: "Main Club Administrator",
    camera: "Sony Alpha a7 IV",
    lens: "FE 24-70mm f/2.8 GM",
    iso: 320,
    aperture: "f/3.5",
    shutter: "1/80s",
    comments: []
  },
  {
    id: "gal-16",
    title: "Analyzing Optical Fiber Cable Modules",
    category: "hardware",
    url: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80",
    description: "A close-up of a high-speed fiber patch panel used to wire Standard High School's inter-block communication nodes.",
    date: "April 10, 2026",
    location: "Admin Infrastructure Room",
    likes: 41,
    photographer: "Musinguzi Arthur",
    photographerTitle: "Networks Overseer",
    camera: "Sony Alpha a6400",
    lens: "E 30mm f/3.5 Macro",
    iso: 200,
    aperture: "f/5.6",
    shutter: "1/100s",
    comments: []
  },
  {
    id: "gal-17",
    title: "Girls-in-STEM Collaborative Session",
    category: "members",
    url: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=800&q=80",
    description: "STAHIZZA women coders constructing interactive learning interfaces and database visualizers to empower incoming S.1 candidates.",
    date: "May 15, 2026",
    location: "Main Science Lab",
    likes: 49,
    photographer: "Nalubega Shadia",
    photographerTitle: "Club Registrar",
    camera: "Canon EOS R6 Mark II",
    lens: "RF 50mm f/1.8 STM",
    iso: 800,
    aperture: "f/2.2",
    shutter: "1/160s",
    comments: [
      { id: "c-8", author: "Nalubega Shadia", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Shadia", text: "Representing girls code initiative! Love this!", date: "May 15, 2026" }
    ]
  },
  {
    id: "gal-18",
    title: "Linux Server Terminal Configurations",
    category: "lab",
    url: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80",
    description: "Inspecting Linux GRUB bootloaders and network protocols on a locally hosted dual-boot terminal workspace unit.",
    date: "May 26, 2026",
    location: "Terminal Sandbox 04",
    likes: 35,
    photographer: "Kato Ivan",
    photographerTitle: "Hardware Lead",
    camera: "Fujifilm X-T5",
    lens: "XF 35mm f/1.4 R",
    iso: 640,
    aperture: "f/2.0",
    shutter: "1/125s",
    comments: []
  },
  {
    id: "gal-19",
    title: "Computer Architecture Logic Gates Slate",
    category: "lab",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    description: "Drafting microchip instruction routes, multiplexers, and floating point operational blocks during afternoon computing revision seminars.",
    date: "May 11, 2026",
    location: "Theoretical Nodule Hall",
    likes: 24,
    photographer: "Atamba Joel",
    photographerTitle: "Main Club Administrator",
    camera: "Sony Alpha a7 IV",
    lens: "FE 24-70mm f/2.8 GM",
    iso: 250,
    aperture: "f/4.0",
    shutter: "1/80s",
    comments: []
  },
  {
    id: "gal-20",
    title: "Brainstorming Session for Dynamic App Hub",
    category: "members",
    url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    description: "The core design committee refining the neon dark UI theme hierarchy and database triggers to ensure standard-high security compliance.",
    date: "April 20, 2026",
    location: "ICT Nodule Office",
    likes: 56,
    photographer: "Mrs. Nabankema Beatrice",
    photographerTitle: "Club Patron / Faculty",
    camera: "Nikon D7500",
    lens: "AF-S DX 18-140mm f/3.5-5.6G",
    iso: 800,
    aperture: "f/4.0",
    shutter: "1/120s",
    comments: []
  },
  {
    id: "gal-21",
    title: "VR Simulation Experience Setup",
    category: "trips",
    url: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80",
    description: "Members trying real-time virtual simulation environments at our ICT outreach camp program, practicing simulated networking hardware layouts.",
    date: "May 01, 2026",
    location: "Makerere Innovation Center",
    likes: 62,
    photographer: "Atamba Joel",
    photographerTitle: "Main Club Administrator",
    camera: "Sony Alpha a7 IV",
    lens: "FE 24-70mm f/2.8 GM",
    iso: 1600,
    aperture: "f/2.8",
    shutter: "1/200s",
    comments: [
      { id: "c-9", author: "Lule Timothy", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Timothy", text: "I actually tried the hardware virtualization loop. Mind blowing!", date: "May 01, 2026" }
    ]
  },
  {
    id: "gal-22",
    title: "Soldering Circuit Resistors Repair Exercise",
    category: "hardware",
    url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80",
    description: "High visual detail showing precision soldering tools repairing loose circuit capacitors on school terminal power supply units.",
    date: "April 18, 2026",
    location: "Hardware Maintenance Nodule",
    likes: 39,
    photographer: "Kato Ivan",
    photographerTitle: "Hardware Lead",
    camera: "Fujifilm X-T5",
    lens: "XF 80mm f/2.8 Macro R",
    iso: 320,
    aperture: "f/8.0",
    shutter: "1/60s",
    comments: []
  },
  {
    id: "gal-23",
    title: "School ICT Bulletin Notice Assembly",
    category: "members",
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    description: "Our dedicated webmasters updating physical bulletins and tracking digital notice submission logs at block centers.",
    date: "May 03, 2026",
    location: "Notice Board Block B",
    likes: 17,
    photographer: "Nalubega Shadia",
    photographerTitle: "Club Registrar",
    camera: "Canon EOS R6 Mark II",
    lens: "RF 24-105mm f/4 L IS USM",
    iso: 500,
    aperture: "f/4.0",
    shutter: "1/100s",
    comments: []
  },
  {
    id: "gal-24",
    title: "Relational Database Modelling Drill",
    category: "contest",
    url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80",
    description: "Scholars designing clean database ERDs (Entity Relationship Diagrams), modeling primary keys AND foreign constraints to fit specific UNEB ICT exam standards.",
    date: "May 19, 2026",
    location: "Science Block Suite 3",
    likes: 47,
    photographer: "Musinguzi Arthur",
    photographerTitle: "Networks Overseer",
    camera: "Sony Alpha a6400",
    lens: "E 18-135mm f/3.5-5.6",
    iso: 800,
    aperture: "f/4.5",
    shutter: "1/125s",
    comments: []
  },
  {
    id: "gal-25",
    title: "Webmaster At Work on Code Sandboxes",
    category: "lab",
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    description: "A close-up view of nested code classes, checking CSS flex-grow responsive strategies and interactive keyframes animations.",
    date: "May 28, 2026",
    location: "Terminal Workspace 05",
    likes: 44,
    photographer: "Atamba Joel",
    photographerTitle: "Main Club Administrator",
    camera: "Sony Alpha a7 IV",
    lens: "FE 24-70mm f/2.8 GM",
    iso: 200,
    aperture: "f/2.8",
    shutter: "1/200s",
    comments: []
  },
  {
    id: "gal-26",
    title: "System Software Command Line Basics",
    category: "lab",
    url: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80",
    description: "Underclassmen practicing command line terminal options (mkdir, cd, ls, grep) to inspect local filesystems.",
    date: "May 17, 2026",
    location: "Primary Suite, Terminal 08",
    likes: 21,
    photographer: "Kato Ivan",
    photographerTitle: "Hardware Lead",
    camera: "Fujifilm X-T5",
    lens: "XF 35mm f/1.4 R",
    iso: 400,
    aperture: "f/1.8",
    shutter: "1/160s",
    comments: []
  },
  {
    id: "gal-27",
    title: "Regional Science Outreach Seminar",
    category: "trips",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    description: "Representing STAHIZZA's advanced digital platform in front of regional computer study instructors, demonstrating seamless SQLite interfaces.",
    date: "April 12, 2026",
    location: "District Education Headquarters",
    likes: 59,
    photographer: "Mrs. Nabankema Beatrice",
    photographerTitle: "Club Patron / Faculty",
    camera: "Nikon D7500",
    lens: "AF-S DX 18-140mm f/3.5-5.6G",
    iso: 1600,
    aperture: "f/5.0",
    shutter: "1/80s",
    comments: []
  },
  {
    id: "gal-28",
    title: "Senior Project Peer Review Activity",
    category: "contest",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    description: "Interactive UI test sessions compiling code sandboxes to verify proper display margins and responsive viewport heights.",
    date: "May 22, 2026",
    location: "ICT Nodule Suite",
    likes: 36,
    photographer: "Atamba Joel",
    photographerTitle: "Main Club Administrator",
    camera: "Sony Alpha a7 IV",
    lens: "FE 24-70mm f/2.8 GM",
    iso: 100,
    aperture: "f/8.0",
    shutter: "1/125s",
    comments: []
  },
  {
    id: "gal-29",
    title: "Inspecting Hardware Collision Domains",
    category: "hardware",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    description: "STAHIZZA junior members identifying switch hubs and network bridging systems during experimental hardware lab drills.",
    date: "May 13, 2026",
    location: "Networks Practical Block",
    likes: 53,
    photographer: "Musinguzi Arthur",
    photographerTitle: "Networks Overseer",
    camera: "Sony Alpha a6400",
    lens: "E 50mm f/1.8 OSS",
    iso: 400,
    aperture: "f/1.8",
    shutter: "1/250s",
    comments: []
  },
  {
    id: "gal-30",
    title: "First Place Trophy Presentation",
    category: "trips",
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    description: "The pride of STAHIZZA! Accepting our team championship certificate for creating advanced web-based teaching models.",
    date: "May 06, 2026",
    location: "National Exhibition Arena",
    likes: 84,
    photographer: "Mrs. Nabankema Beatrice",
    photographerTitle: "Club Patron / Faculty",
    camera: "Nikon D7500",
    lens: "AF-S DX 18-140mm f/3.5-5.6G",
    iso: 800,
    aperture: "f/3.5",
    shutter: "1/100s",
    comments: [
      { id: "c-10", author: "Mrs. Nabankema Beatrice", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Teacher", text: "Stellar performance by our digital squad! Keep rising STAHIZZA!", date: "May 06, 2026" }
    ]
  }
];

export default function Gallery({ userProfile, onGrantXp }: GalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>(() => {
    const saved = localStorage.getItem("stahizza_local_gallery_moments");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_IMAGES;
  });

  const [filter, setFilter] = useState<"all" | "lab" | "contest" | "members" | "trips" | "hardware">("all");
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Custom form upload states
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState<"lab" | "contest" | "members" | "trips" | "hardware">("lab");
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadPhotographer, setUploadPhotographer] = useState("");
  const [uploadCamera, setUploadCamera] = useState("");

  // Fetch from Supabase with auto-bootstrapping of our 30 high-quality snaps
  useEffect(() => {
    async function syncEcosystemGallery() {
      if (!isSupabaseConfigured) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("gallery_images")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("STAHIZZA Supabase Gallery error:", error);
        } else if (data && data.length > 0) {
          const mapped: GalleryImage[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            url: item.url,
            description: item.description,
            date: item.date,
            location: item.location,
            likes: item.likes,
            comments: Array.isArray(item.comments) ? item.comments : [],
            photographer: item.photographer,
            photographerTitle: item.photographer_title || "Contributing Cadet",
            camera: item.camera,
            lens: item.lens,
            iso: item.iso,
            aperture: item.aperture,
            shutter: item.shutter,
            hasLiked: Array.isArray(item.liked_by) ? item.liked_by.includes(userProfile?.id || userProfile?.name || "anonymous") : false
          }));
          setImages(mapped);
        } else {
          // Auto-bootstrap our 30 snaps so database is pre-populated
          const seedPayload = INITIAL_IMAGES.map(img => ({
            id: img.id,
            title: img.title,
            category: img.category,
            url: img.url,
            description: img.description,
            date: img.date,
            location: img.location,
            likes: img.likes,
            comments: img.comments,
            photographer: img.photographer,
            photographer_title: img.photographerTitle,
            camera: img.camera,
            lens: img.lens,
            iso: img.iso,
            aperture: img.aperture,
            shutter: img.shutter,
            liked_by: []
          }));

          const { error: seedErr } = await supabase
            .from("gallery_images")
            .insert(seedPayload);
          
          if (seedErr) {
            console.error("STAHIZZA auto-seed error:", seedErr);
          } else {
            setImages(INITIAL_IMAGES);
          }
        }
      } catch (err) {
        console.error("Gallery Sync catch:", err);
      } finally {
        setLoading(false);
      }
    }
    syncEcosystemGallery();
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("stahizza_local_gallery_moments", JSON.stringify(images));
  }, [images]);

  // Handle high quality photo like
  const handleLike = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    let updatedImg: GalleryImage | null = null;
    
    setImages(prev => prev.map(img => {
      if (img.id === id) {
        const nextLiked = !img.hasLiked;
        const nextLikes = nextLiked ? img.likes + 1 : img.likes - 1;
        
        if (nextLiked) {
          onGrantXp(5, `Liked a club moment: "${img.title}"`);
        }
        
        const updated = {
          ...img,
          likes: nextLikes,
          hasLiked: nextLiked
        };
        updatedImg = updated;
        
        // Update currently selected image in frame if open
        if (selectedImage && selectedImage.id === id) {
          setSelectedImage(updated);
        }
        
        return updated;
      }
      return img;
    }));

    if (isSupabaseConfigured && updatedImg) {
      try {
        const uId = userProfile?.id || userProfile?.name || "anonymous";
        const { data: currentItem } = await supabase
          .from("gallery_images")
          .select("liked_by")
          .eq("id", id)
          .single();
        
        let nextLikedBy: string[] = currentItem?.liked_by || [];
        if (nextLikedBy.includes(uId)) {
          nextLikedBy = nextLikedBy.filter(u => u !== uId);
        } else {
          nextLikedBy.push(uId);
        }

        await supabase
          .from("gallery_images")
          .update({
            likes: (updatedImg as GalleryImage).likes,
            liked_by: nextLikedBy
          })
          .eq("id", id);
      } catch (err) {
        console.error("Error syncing like to Supabase:", err);
      }
    }
  };

  // Add custom user comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedImage) return;

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      author: userProfile?.name || "Anonymous Cadet",
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile?.name || "Anon"}`,
      text: newCommentText.trim(),
      date: "Today"
    };

    let updatedImg: GalleryImage | null = null;

    setImages(prev => prev.map(img => {
      if (img.id === selectedImage.id) {
        const nextComments = [...img.comments, newComment];
        const updated = {
          ...img,
          comments: nextComments
        };
        updatedImg = updated;
        setSelectedImage(updated);
        
        onGrantXp(10, `Commented on club moment: "${img.title}"`);
        return updated;
      }
      return img;
    }));

    setNewCommentText("");

    if (isSupabaseConfigured && updatedImg) {
      try {
        await supabase
          .from("gallery_images")
          .update({
            comments: (updatedImg as GalleryImage).comments
          })
          .eq("id", selectedImage.id);
      } catch (err) {
        console.error("Error syncing comments to Supabase:", err);
      }
    }
  };

  // Save brand new uploaded image
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadDescription.trim()) return;

    const defaultUrl = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80";
    const newImage: GalleryImage = {
      id: `gal-custom-${Date.now()}`,
      title: uploadTitle.trim(),
      category: uploadCategory,
      url: uploadUrl.trim() || defaultUrl,
      description: uploadDescription.trim(),
      date: "Today",
      location: "STAHIZZA Campus",
      likes: 1,
      photographer: uploadPhotographer.trim() || "Cadet " + (userProfile?.name || "Scholar"),
      photographerTitle: "Contributing Scholar",
      camera: uploadCamera.trim() || "Mainstream Phone Unit",
      lens: "Standard Focal Lens",
      iso: 400,
      aperture: "f/2.4",
      shutter: "1/120s",
      comments: [],
      hasLiked: true
    };

    setImages(prev => [newImage, ...prev]);
    setIsUploading(false);

    // Reset fields
    setUploadTitle("");
    setUploadUrl("");
    setUploadDescription("");
    setUploadPhotographer("");
    setUploadCamera("");

    // Grant premium XP reward
    onGrantXp(25, "Uploaded high-resolution activity media to STAHIZZA Gallery!");

    if (isSupabaseConfigured) {
      try {
        const payload = {
          id: newImage.id,
          title: newImage.title,
          category: newImage.category,
          url: newImage.url,
          description: newImage.description,
          date: newImage.date,
          location: newImage.location,
          likes: newImage.likes,
          comments: newImage.comments,
          photographer: newImage.photographer,
          photographer_title: newImage.photographerTitle,
          camera: newImage.camera,
          lens: newImage.lens,
          iso: newImage.iso,
          aperture: newImage.aperture,
          shutter: newImage.shutter,
          liked_by: [userProfile?.id || userProfile?.name || "anonymous"]
        };
        await supabase
          .from("gallery_images")
          .insert(payload);
      } catch (err) {
        console.error("Error saving new image to Supabase:", err);
      }
    }
  };

  // Handle deletion of image by authorized officers
  const handleDeleteImage = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Check privilege: must be president or cabinet role
    const isAuthorized = userProfile?.role === "president" || userProfile?.role === "cabinet";
    if (!isAuthorized) {
      alert("Unauthorized access: Delete permission reserved for Club Presidents or Cabinet Officers.");
      return;
    }

    if (!confirm("Are you sure you want to delete this picture from STAHIZZA Database? This operates permanently.")) {
      return;
    }

    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("gallery_images")
          .delete()
          .eq("id", id);
        if (error) {
          console.error("Supabase image deletion error:", error);
        }
      } catch (err) {
        console.error("Error deleting image from Supabase:", err);
      }
    }
  };

  const filteredImages = images.filter(img => {
    const matchesCategory = filter === "all" || img.category === filter;
    const matchesSearch = img.title.toLowerCase().includes(search.toLowerCase()) || 
                          img.description.toLowerCase().includes(search.toLowerCase()) ||
                          img.photographer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6" id="stahizza-moments-gallery">
      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 sm:p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[9px] font-mono bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-md font-bold uppercase tracking-widest animate-pulse">
              Media Nodule
            </span>
            <span className="text-slate-500 text-xs font-mono">•</span>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
              <Camera className="w-3.5 h-3.5" />
              <span>STAHIZZA EXIF DATABASE</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight font-sans uppercase">
            STAHIZZA <span className="bg-gradient-to-r from-pink-500 to-indigo-400 bg-clip-text text-transparent">ICT Club Gallery</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed font-sans">
            A highly polished visual chronicle compiling hands-on computer engineering laboratories, intense inter-school coding challenges, local network crimping camps, and O/A-level tech achievements.
          </p>
        </div>

        <button
          onClick={() => setIsUploading(true)}
          className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-semibold font-sans text-xs px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-md shadow-pink-950/20"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Club Snapshot</span>
        </button>
      </div>

      {/* Filter and Search Bar controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-900">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1">
          {[
            { id: "all", label: "All Highlights" },
            { id: "lab", label: "Computer Lab" },
            { id: "contest", label: "Coding Contests" },
            { id: "members", label: "Club Members" },
            { id: "trips", label: "Field Trips" },
            { id: "hardware", label: "Hardware & LAN" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all duration-150 ${
                filter === tab.id
                  ? "bg-slate-800 text-pink-400 border border-pink-500/20 shadow-md shadow-pink-950/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input bar */}
        <div className="relative md:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search title, photographer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 focus:border-pink-500/50 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600 font-sans"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Images bento-like structural grid */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.04
            }
          }
        }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {filteredImages.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-slate-900/15 border border-dashed border-slate-800 rounded-3xl">
            <ImageIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <h3 className="font-bold text-slate-300 font-sans text-sm">No snaps found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No gallery images matches the "{search}" searching criteria. Feel free to contribute one yourself to earn XP!
            </p>
          </div>
        ) : (
          filteredImages.map((img, idx) => (
            <motion.div
              key={img.id}
              variants={{
                hidden: { opacity: 0, y: 15, scale: 0.96 },
                show: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 90,
                    damping: 14
                  }
                }
              }}
              whileHover={{ 
                scale: 1.02,
                y: -6,
                borderColor: "rgba(236, 72, 153, 0.3)",
                transition: { duration: 0.2, ease: "easeOut" }
              }}
              onClick={() => setSelectedImage(img)}
              className="group bg-slate-900/35 border border-slate-800/60 rounded-2xl overflow-hidden cursor-pointer flex flex-col transition-all duration-350 shadow-lg shadow-slate-950/20"
            >
              {/* Photo representation layer */}
              <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden shrink-0">
                <img
                  src={img.url}
                  alt={img.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                
                {/* Visual dark overlay for hover elements */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent opacity-60 group-hover:opacity-75 transition-opacity" />
                
                {/* Category tag bubble overlay */}
                <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-[8px] font-mono rounded-md font-bold uppercase tracking-wider ${
                  img.category === "lab" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                  img.category === "contest" ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" :
                  img.category === "members" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                  img.category === "trips" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}>
                  {img.category === "lab" ? "Computer Lab" :
                   img.category === "contest" ? "Hackathons" :
                   img.category === "members" ? "Club Members" :
                   img.category === "trips" ? "Field Trips" :
                   "Hardware & LAN"}
                </span>

                {/* Micro action overlays */}
                <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {(userProfile?.role === "president" || userProfile?.role === "cabinet") && (
                    <button
                      onClick={(e) => handleDeleteImage(img.id, e)}
                      title="Delete Snapshot"
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-950/80 border border-red-500/40 text-red-400 hover:text-red-200 hover:bg-red-800 backdrop-blur-md transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleLike(img.id, e)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-md transition-all ${
                      img.hasLiked 
                        ? "bg-pink-600 text-white" 
                        : "bg-slate-900/70 text-slate-300 hover:text-pink-400 hover:bg-slate-900"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${img.hasLiked ? "fill-current" : ""}`} />
                  </button>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-900/70 text-slate-300 backdrop-blur-md">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Photo summary block aligned at bottom */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
                  <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{img.date}</span>
                  </span>
                  <h4 className="text-xs font-bold text-white truncate drop-shadow-sm font-sans mt-0.5">
                    {img.title}
                  </h4>
                </div>
              </div>

              {/* Informational Lower layer */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3 bg-slate-950/20">
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
                  {img.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-500">
                  <div className="flex items-center gap-1 truncate max-w-[120px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    <span className="truncate">{img.photographer}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-0.5 hover:text-pink-400">
                      <Heart className={`w-3 h-3 ${img.hasLiked ? "text-pink-500 fill-current" : ""}`} />
                      <span>{img.likes}</span>
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MessageCircle className="w-3 h-3" />
                      <span>{img.comments.length}</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Brand new upload snapshot overlay popup modal */}
      <AnimatePresence>
        {isUploading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-pink-400" />
                  <span className="font-sans font-bold text-xs text-slate-100 uppercase tracking-widest">Contribute Media to Database</span>
                </div>
                <button
                  onClick={() => setIsUploading(false)}
                  className="text-slate-500 hover:text-slate-300 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="p-4 sm:p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Photo Title</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    placeholder="e.g., S.4 final relational database practical project"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Category Group</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500/50 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none transition-all cursor-pointer font-sans"
                    >
                      <option value="lab">Computer Lab</option>
                      <option value="contest">Coding Contests</option>
                      <option value="members">Club Members</option>
                      <option value="trips">Field Trips</option>
                      <option value="hardware">Hardware & LAN</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Unsplash or Image URL</label>
                    <input
                      type="url"
                      placeholder="Leave blank for random placeholder"
                      value={uploadUrl}
                      onChange={(e) => setUploadUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Photo Description</label>
                  <textarea
                    required
                    maxLength={200}
                    rows={2.5}
                    placeholder="Describe what club activities are taking place in this image..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-755 resize-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Photographer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Joel Atamba"
                      value={uploadPhotographer}
                      onChange={(e) => setUploadPhotographer(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Camera Model</label>
                    <input
                      type="text"
                      placeholder="e.g. Sony a7R V"
                      value={uploadCamera}
                      onChange={(e) => setUploadCamera(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 flex items-start gap-2.5">
                  <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    <span className="font-semibold text-slate-300">XP Synchronizer Info:</span> Uploading realistic school computing snapshots grants <strong className="text-pink-400">+25 XP</strong> directly down into your dynamic profile scoreboard indexes.
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUploading(false)}
                    className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 font-semibold font-sans text-xs py-2.5 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-semibold font-sans text-xs py-2.5 rounded-xl transition-all hover:scale-[1.01]"
                  >
                    Publish Snapshot
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exquisite Lightbox Details Viewer overlay */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]"
            >
              {/* Image Column */}
              <div className="md:w-3/5 bg-slate-950 relative flex items-center justify-center min-h-[250px] md:min-h-0">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain max-h-[45vh] md:max-h-full"
                />
                
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="bg-slate-900/80 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border border-slate-700/50">
                    EXIF METADATA LOADED
                  </span>
                </div>

                {/* Like floating trigger overlay */}
                <button
                  onClick={() => handleLike(selectedImage.id)}
                  className={`absolute bottom-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg transition-all ${
                    selectedImage.hasLiked
                      ? "bg-pink-600 text-white hover:bg-pink-500"
                      : "bg-slate-900/85 text-slate-200 hover:text-pink-400 hover:bg-slate-900"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${selectedImage.hasLiked ? "fill-current" : ""}`} />
                </button>
              </div>

               {/* Sidebar Info Column */}
              <div className="md:w-2/5 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col min-h-0 bg-slate-955">
                {/* Header panel inside sidebar */}
                <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex items-start justify-between">
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-[9px] font-mono text-pink-400 font-extrabold uppercase tracking-wide">
                      Category - {selectedImage.category}
                    </span>
                    <h3 className="font-bold text-slate-100 font-sans text-sm truncate uppercase tracking-tight">
                      {selectedImage.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {(userProfile?.role === "president" || userProfile?.role === "cabinet") && (
                      <button
                        onClick={() => handleDeleteImage(selectedImage.id)}
                        title="Delete this picture"
                        className="text-red-400 hover:text-red-350 hover:bg-red-500/10 p-1.5 rounded-lg border border-red-500/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Scrollable meta & comments */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 text-xs">
                  {/* Photo details description */}
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] uppercase font-mono text-slate-500 font-bold tracking-wider">Description</h4>
                    <p className="text-slate-300 leading-relaxed font-sans">{selectedImage.description}</p>
                  </div>

                  {/* Physical attributes Metadata Panel */}
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 space-y-2">
                    <h4 className="text-[9px] uppercase font-mono text-amber-500 font-bold tracking-wider flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>EXIF Camera Configurations</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-mono text-slate-400">
                      <div>
                        <span className="text-slate-600">Camera:</span> <span className="text-slate-300">{selectedImage.camera}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Lens:</span> <span className="text-slate-300">{selectedImage.lens}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">ISO Index:</span> <span className="text-slate-300">{selectedImage.iso}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Aperture:</span> <span className="text-slate-300">{selectedImage.aperture}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Exposure:</span> <span className="text-slate-300">{selectedImage.shutter}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Captured:</span> <span className="text-slate-300">{selectedImage.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location & Author Panel */}
                  <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-sans border-t border-b border-slate-850/50 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Located: <strong className="text-slate-200">{selectedImage.location}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <UserCheck className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span>By: <strong className="text-slate-200">{selectedImage.photographer}</strong> ({selectedImage.photographerTitle})</span>
                    </div>
                  </div>

                  {/* Live comments thread list */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] uppercase font-mono text-slate-500 font-bold tracking-wider flex items-center justify-between">
                      <span>Comments ({selectedImage.comments.length})</span>
                      <span className="text-[8px] tracking-normal font-normal text-indigo-400 lowercase">Stateful sandbox sync</span>
                    </h4>

                    {selectedImage.comments.length === 0 ? (
                      <p className="text-[10px] font-mono text-slate-600 italic">No classmate reviews submitted yet. Write the first comment below!</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedImage.comments.map(comm => (
                          <div key={comm.id} className="p-2.5 bg-slate-900 border border-slate-850 rounded-xl space-y-1 text-left">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-300 text-[10px]">{comm.author}</span>
                              <span className="text-[8px] font-mono text-slate-550 shrink-0">{comm.date}</span>
                            </div>
                            <p className="text-slate-400 text-[11px] font-sans leading-relaxed">{comm.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer submit review block */}
                <form onSubmit={handleAddComment} className="p-3 bg-slate-950 border-t border-slate-850 flex gap-1.5 shrink-0">
                  <input
                    type="text"
                    required
                    maxLength={140}
                    placeholder="Provide a review review..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-pink-500/50 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600 font-sans"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-pink-400 p-2 rounded-lg transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
