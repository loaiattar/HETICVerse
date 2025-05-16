export default function CommentResponse() {

    return (
      <div className="flex flex-end w-full py-4 pl-15">
  
        <div className="flex flex-col flex-1 text-white space-y-2">
          
          {/* Avatar, Pseudo and date */}
          <div className="flex flex-row gap-3">
            <div className="w-5 h-5 rounded-full bg-white/20 shrink-0" />
            <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-xs">Random Name</span>
                <span className="text-white/40 font-normal">· 1min ago</span>
            </div>
          </div>
        
          {/* Texte du commentaire */}
          <p className="text-white/80 text-base leading-relaxed">
            Good but Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ullam nam quasi odio eum
            maiores eos exercitationem commodi perferendis unde quas.
          </p>

          </div>
        </div>
    );
  }