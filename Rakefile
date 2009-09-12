# Modified from peterc: http://gist.github.com/113226
desc "Automatically run couchapp push"
task :autopush do
  require 'find'
  files = {}
  push = 'couchapp push'
  loop do
    changed = false
    Find.find(File.dirname(__FILE__)) do |file|
      ctime = File.ctime(file).to_i
 
      if ctime != files[file]
        files[file] = ctime
        changed = true
      end
    end
 
    if changed
      puts "Running #{push} at #{Time.now}"
      system "#{push}"
      puts "\nWaiting for a file change"
    end
 
    sleep 1
  end
end